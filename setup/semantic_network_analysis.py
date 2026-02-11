# Core imports
import os
import glob
import json
import logging
import pandas as pd
import networkx as nx
from collections import defaultdict, Counter
from itertools import combinations

# NLP
import nltk
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('averaged_perceptron_tagger_eng', quiet=True)
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag

# ML
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

def collect_transcripts():
    transcript_list = glob.glob(os.path.join("/materials", "*", "*.srt"))
    transcripts = []
    
    for file in transcript_list:
        filename = os.path.basename(file)
        filename = filename.split('_transcript.srt')[0]

        # Clean the transcript by removing timestamps, sequence numbers, and any irrelevant lines
        text = ''
        with open(file, 'r') as f:
            lines = f.read().strip().split('\n')
            cleaned_lines = []
            for line in lines:
                if line.isdigit() or '-->' in line or "Transcriber's Name Reviewer's Name" in line:
                    continue
                cleaned_lines.append(line)
            text = ' '.join(cleaned_lines)
        
        transcripts.append({
            'filename': filename,
            'text': text
        })
        
    db = pd.DataFrame(transcripts)
    return db

class TextProcessor:
    """Clean and extract keywords from text."""

    def __init__(self, custom_stopwords=None):
        self.stop_words = set(stopwords.words('english'))
        # Add common filler words
        self.stop_words.update([
            'like', 'just', 'really', 'thing', 'things', 'way', 'lot',
            'going', 'got', 'know', 'want', 'think', 'say', 'said',
            'laughter', 'applause', 'music'  # TED-specific
        ])
        if custom_stopwords:
            self.stop_words.update(custom_stopwords)

    def clean(self, text):
        """Basic text cleaning."""
        text = str(text).lower()
        text = ' '.join(text.split())  # normalize whitespace
        return text

    def extract_keywords(self, text, pos_filter=None, min_length=3):
        """
        Extract keywords using POS tagging.

        Args:
            text: Input text
            pos_filter: List of POS tags to keep (default: nouns, verbs, adjectives)
            min_length: Minimum word length
        """
        if pos_filter is None:
            pos_filter = ['NN', 'NNS', 'NNP', 'NNPS', 'JJ', 'VB', 'VBG', 'VBN']

        text = self.clean(text)
        tokens = word_tokenize(text)
        tagged = pos_tag(tokens)

        keywords = [
            word for word, pos in tagged
            if pos in pos_filter
            and word not in self.stop_words
            and len(word) >= min_length
            and word.isalpha()
        ]
        return keywords

    def get_sentences(self, text):
        """Split text into sentences."""
        return sent_tokenize(str(text))

class PerTalkNetworkBuilder:
    """
    Build co-occurrence networks for individual transcripts.

    Nodes = keywords, Edges = co-occurrence within sliding window
    """

    def __init__(self, processor):
        self.processor = processor

    def build(self, text, file_path=None, save_json=True, window_size=5, min_freq=2, min_cooc=1):
        """
        Build co-occurrence network.

        Args:
            text: Transcript text
            window_size: Sliding window size for co-occurrence
            min_freq: Minimum term frequency to include
            min_cooc: Minimum co-occurrence count for edge

        Returns:
            NetworkX Graph
        """
        keywords = self.processor.extract_keywords(text)

        # Count frequencies
        term_freq = Counter(keywords)
        valid_terms = {t for t, f in term_freq.items() if f >= min_freq}

        # Count co-occurrences in sliding window
        cooc = defaultdict(int)
        for i in range(len(keywords) - window_size + 1):
            window = [t for t in keywords[i:i + window_size] if t in valid_terms]
            for t1, t2 in combinations(set(window), 2):
                pair = tuple(sorted([t1, t2]))
                cooc[pair] += 1

        # Build graph
        G = nx.Graph()

        for term in valid_terms:
            G.add_node(term, freq=term_freq[term])

        for (t1, t2), weight in cooc.items():
            if weight >= min_cooc:
                G.add_edge(t1, t2, weight=weight)

        # Remove isolated nodes
        G.remove_nodes_from(list(nx.isolates(G)))

        if save_json:
          pos = nx.spring_layout(G, k=2, iterations=50, seed=42)
          degrees = dict(G.degree())
          node_traces = [[node,
               {
                "x": float(pos[node][0]),
                "y": float(pos[node][1]),
                "label": node,
                "size": degrees[node]
                }]
                for node in G.nodes()]
          edge_traces = [[u, v] for u,v in G.edges()]

          with open(file_path, 'w+') as f:
              json.dump({"node_traces": node_traces, "edge_traces": edge_traces}, f)

class CrossTalkNetworkBuilder:
    """
    Build networks where talks are nodes and edges represent similarity.

    Methods:
        - TF-IDF cosine similarity
        - SBERT embedding similarity
    """

    def __init__(self):
        self.tfidf = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1
        )
        self._sbert = None

        # Cache similarity matrices
        self.tfidf_matrix = None
        self.embedding_matrix = None

    @property
    def sbert(self):
        """Lazy load SBERT model."""
        if self._sbert is None:
            self._sbert = SentenceTransformer('all-MiniLM-L6-v2')
        return self._sbert

    def compute_tfidf_similarity(self, texts):
        """Compute TF-IDF cosine similarity matrix."""
        tfidf_vectors = self.tfidf.fit_transform(texts)
        self.tfidf_matrix = cosine_similarity(tfidf_vectors)
        return self.tfidf_matrix

    def compute_embedding_similarity(self, texts):
        """Compute SBERT embedding cosine similarity matrix."""
        embeddings = self.sbert.encode(texts, show_progress_bar=True)
        self.embedding_matrix = cosine_similarity(embeddings)
        return self.embedding_matrix

    def build_network(self, df, similarity_matrix, threshold=0.5, save_json=False, file_path=None):
        """
        Build network from similarity matrix.

        Args:
            df: DataFrame with talk metadata
            similarity_matrix: Pairwise similarity matrix
            threshold: Minimum similarity to create edge

        Returns:
            NetworkX Graph
        """
        G = nx.Graph()

        # Add nodes
        for idx, row in df.iterrows():
            G.add_node(row['filename'])

        # Add edges based on threshold
        n = len(df)
        for i in range(n):
            for j in range(i + 1, n):
                sim = similarity_matrix[i, j]
                if sim >= threshold:
                    G.add_edge(
                        df.iloc[i]['filename'],
                        df.iloc[j]['filename'],
                        weight=float(sim)
                    )
        if save_json:
          pos = nx.spring_layout(G, k=2, iterations=50, seed=42)
          degrees = dict(G.degree())

          node_traces = [[node,
               {
                "x": float(pos[node][0]),
                "y": float(pos[node][1]),
                "size": (degrees[node])*2.
                }]
                for node in G.nodes()]
          edge_traces = [[u, v] for u,v in G.edges()]

          with open(file_path, 'w+') as f:
              json.dump({"node_traces": node_traces, "edge_traces": edge_traces}, f)

def pertalk_network_analysis(df, processor):
    per_talk_builder = PerTalkNetworkBuilder(processor)

    for idx, row in df.iterrows():
        per_talk_builder.build(
            row['text'],
            save_json=True,
            file_path=f"/materials/{row['filename']}/{row['filename']}_per_talk.json",
            window_size=5,
            min_freq=2,
            min_cooc=1
        )
    logging.info("Per-talk networks built and saved as JSON")

def crosstalk_network_analysis(df):
    cross_talk_builder = CrossTalkNetworkBuilder()
    texts = df['text'].tolist()

    tfidf_sim = cross_talk_builder.compute_tfidf_similarity(texts)
    embed_sim = cross_talk_builder.compute_embedding_similarity(texts)

    cross_talk_builder.build_network(df, tfidf_sim, threshold=0.15, save_json=True, file_path="/materials/tfidf.json")
    cross_talk_builder.build_network(df, embed_sim, threshold=0.3, save_json=True, file_path="/materials/sbert.json")
    logging.info("Cross-talk networks built and saved as JSON")

def setup_semantic_network_analysis():
    db = collect_transcripts()
    processor = TextProcessor()
    pertalk_network_analysis(db, processor)
    crosstalk_network_analysis(db)
