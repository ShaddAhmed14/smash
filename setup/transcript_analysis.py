import os
import json
import warnings
import nltk
import glob
import pandas as pd
import numpy as np
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from umap import UMAP
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import CountVectorizer
from nltk.tokenize import sent_tokenize

warnings.filterwarnings('ignore')

try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError: # Corrected exception type
    nltk.download('vader_lexicon')
from nltk.sentiment.vader import SentimentIntensityAnalyzer

try:
    nltk.data.find('corpora/stopwords.zip/stopwords/')
except LookupError: # Corrected exception type
    nltk.download('stopwords')
from nltk.corpus import stopwords

nltk.download('punkt_tab')

def clean_srt_transcript(srt_content):
    lines = srt_content.strip().split('\n')
    cleaned_lines = []
    for i, line in enumerate(lines):
        # Skip empty lines, lines with only numbers (index), and lines with timestamps
        if line.strip() == '' or line.isdigit() or '-->' in line or "Transcriber's Name Reviewer's Name" in line:
            continue
        # Keep the line if it doesn't fit the patterns above
        cleaned_lines.append(line)

    return ' '.join(cleaned_lines)

def create_transcript_db():
    transcript_list = glob.glob(os.path.join("/materials", "*", "*.srt"))
    data = []
    for file_path in transcript_list:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            data.append({'title': file_path, 'transcript': content})
    
    df = pd.DataFrame(data)
    df['cleaned_transcript'] = df['transcript'].apply(clean_srt_transcript)
    stop_words = set(stopwords.words('english'))
    df['cleaned_transcript'] = df['cleaned_transcript'].apply(lambda x: ' '.join([word for word in x.split() if word.lower() not in stop_words]))
    df['word_count'] = df['cleaned_transcript'].apply(lambda x: len(x.split()))
    
    return df

def video_cluster(document_topic_probabilities, titles, df):
    output_path = '/materials/video_plot_data.json'
    # if os.path.exists(output_path):
    #     print(f"Video plot data already exists at {output_path}. Skipping video clustering.")
    #     return
    doc_prob_df = pd.DataFrame(document_topic_probabilities, index=titles)
    # Group by video title and calculate the mean topic distribution for each video
    video_topic_distributions_df = doc_prob_df.groupby(level=0).mean()
    # Get the video titles in the correct order after grouping
    video_titles_ordered = video_topic_distributions_df.index.tolist()
    # Get the aggregated topic distributions as a numpy array
    video_topic_distributions = video_topic_distributions_df.values
    # Reduce dimensionality of video topic distributions to 2D for visualization
    umap_model_2d_videos = UMAP(n_components=2, metric='cosine', random_state=42)
    print(video_topic_distributions.shape)
    video_coords = umap_model_2d_videos.fit_transform(video_topic_distributions)

    video_plot_data = []
    topics_by_title = df.set_index('title')['topics'].to_dict()

    for i, title in enumerate(video_titles_ordered):
        video_data = {
            'title': title,
            'x': float(video_coords[i, 0]),
            'y': float(video_coords[i, 1]),
            'topics': [int(t) for t in topics_by_title.get(title, [])] # Get topics, ensure integers, handle potential missing titles
        }
        video_plot_data.append(video_data)

    with open(output_path, 'w') as f: # Video Clusters based on Topic Distribution
        json.dump(video_plot_data, f, indent=4)

def topic_interdistance(topic_model, video_topics_df):
    output_path = '/materials/topic_plot_data.json'
    # if os.path.exists(output_path):
    #     print(f"Topic plot data already exists at {output_path}. Skipping topic interdistance calculation.")
    #     return
    topic_info = topic_model.get_topic_info()
    topic_embeddings = topic_model.topic_embeddings_

    # Remove the outlier topic (-1) for visualization
    topic_info = topic_info.loc[topic_info.Topic != -1, :]
    topic_embeddings = topic_embeddings[topic_info.index] # Use index for filtering embeddings

    # Reduce dimensionality of topic embeddings to 2D using UMAP
    umap_model_topics = UMAP(n_neighbors=10, n_components=2, min_dist=0.0, metric='cosine', random_state=42)
    topic_coords = umap_model_topics.fit_transform(topic_embeddings)
    # Add coordinates to topic_info DataFrame
    topic_info['x'] = topic_coords[:, 0]
    topic_info['y'] = topic_coords[:, 1]
    # Get top words and associated videos for each topic
    top_words_and_videos = []
    # Create a dictionary for easy lookup of videos by topic
    videos_by_topic = video_topics_df.groupby('topics')['title'].apply(list).to_dict()

    for topic_id in topic_info['Topic']:
        words = topic_model.get_topic(topic_id)
        top_words_str = ", ".join([word[0] for word in words])

        associated_videos = videos_by_topic.get(topic_id, [])
        videos_str = "<br>".join(associated_videos[:5]) + (f"<br>and {len(associated_videos) - 5} more..." if len(associated_videos) > 5 else "")

        top_words_and_videos.append({
            'Topic': int(topic_id), # Ensure topic id is int for JSON
            'Name': topic_info[topic_info['Topic'] == topic_id]['Name'].iloc[0],
            'Count': int(topic_info[topic_info['Topic'] == topic_id]['Count'].iloc[0]), # Ensure count is int
            'x': float(topic_info[topic_info['Topic'] == topic_id]['x'].iloc[0]), # Ensure coordinates are float
            'y': float(topic_info[topic_info['Topic'] == topic_id]['y'].iloc[0]), # Ensure coordinates are float
            'Top Words': top_words_str,
            'Associated Videos': videos_str
        })

    with open(output_path, 'w') as f: # Intertopic Distance Map
        json.dump(top_words_and_videos, f, indent=4)

def data_map(topic_model, embeddings, titles):
    output_path = '/materials/datamap_data.json'
    # if os.path.exists(output_path):
    #     print(f"Data map already exists at {output_path}. Skipping data map creation.")
    #     return
    topics = topic_model.topics_

    # Reduce embeddings to 2D for visualization
    umap_model = UMAP(n_neighbors=10, n_components=2, min_dist=0.0, metric='cosine', random_state=42)
    reduced_embeddings = umap_model.fit_transform(embeddings) # save

    # Get topic info and select top 10 topics (excluding -1 outliers)
    topic_info = topic_model.get_topic_info()
    top_10_topics = topic_info[topic_info['Topic'] != -1].head(10)['Topic'].tolist()
    data_for_plot = {
        'reduced_embeddings': reduced_embeddings.tolist(),
        'titles': titles,
        'topic_data': [] # To store label, centroid_x, centroid_y for each topic
    }

    for idx, topic in enumerate(top_10_topics):
        topic_mask = np.array(topics) == topic
        topic_docs = reduced_embeddings[topic_mask]

        top_words = topic_model.get_topic(topic)[:3]
        label = ' '.join([w[0] for w in top_words])

        centroid_x = np.mean(topic_docs[:, 0])
        centroid_y = np.mean(topic_docs[:, 1])

        data_for_plot['topic_data'].append({
            'topic_id': int(topic), # Ensure int
            'label': label,
            'centroid_x': float(centroid_x), # Ensure float
            'centroid_y': float(centroid_y), # Ensure float
            'topic_docs': topic_docs.tolist() # Save topic docs as list
        })


    with open(output_path, 'w') as f:
        json.dump(data_for_plot, f, indent=4)
    pass

def temporal_sentiment_analysis(df):
    output_path = '/materials/temporal_sentiment_data.json'
    # if os.path.exists(output_path):
    #     print(f"Temporal sentiment data already exists at {output_path}. Skipping temporal sentiment analysis.")
    #     return
    analyzer = SentimentIntensityAnalyzer()
    df['sentiment_score'] = df['cleaned_transcript'].apply(lambda x: analyzer.polarity_scores(x)['compound'])

    # Define a function to segment transcript and analyze sentiment
    def analyze_temporal_sentiment(transcript, segment_size=50):
        if pd.isna(transcript):
            return []

        words = transcript.split()
        segments = [' '.join(words[i:i + segment_size]) for i in range(0, len(words), segment_size)]

        segment_sentiments = [analyzer.polarity_scores(segment)['compound'] for segment in segments]

        return segment_sentiments

    # Apply the function to the 'transcript' column
    df['temporal_sentiment'] = df['cleaned_transcript'].apply(analyze_temporal_sentiment)
    df['temporal_segments'] = df['temporal_sentiment'].apply(lambda x: list(range(len(x))))
    temporal_sentiment_data = df[['title', 'temporal_sentiment', 'temporal_segments']].to_dict('records')

    with open(output_path, 'w') as f:
        json.dump(temporal_sentiment_data, f, indent=4)

def run_bertopic(df):
    docs = []
    titles = []
    video_transcripts = df['cleaned_transcript'].to_list()
    video_titles = df['title'].to_list()

    for transcript, title in zip(video_transcripts, video_titles):
        sentences = sent_tokenize(transcript)
        docs.extend(sentences)
        titles.extend([title] * len(sentences))
    
    sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = sentence_model.encode(docs)
    vectorizer = CountVectorizer(stop_words="english", max_features=1000)
    umap_model = UMAP(n_neighbors=10, n_components=2, min_dist=0.0, metric='cosine', random_state=42, low_memory=True)
    hdbscan_model = HDBSCAN(min_cluster_size=15, min_samples=2, metric='euclidean', cluster_selection_method='eom', prediction_data=True)

    topic_model = BERTopic(
        embedding_model=sentence_model,
        umap_model=umap_model,
        low_memory=True,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer,
        calculate_probabilities=True,
    ).fit(docs, embeddings)
    
    document_topics, document_topic_probabilities = topic_model.transform(docs, embeddings)
    video_topics = []
    current_video_topics = set()

    for i, topic in enumerate(document_topics):
        current_video_topics.add(topic)
        if i + 1 < len(titles) and titles[i+1] != titles[i]:
            video_topics.append(list(current_video_topics))
            current_video_topics = set()
        elif i == len(titles) - 1:
            video_topics.append(list(current_video_topics))

    df['topics'] = video_topics

    video_topics_df = df[['title', 'topics']].explode('topics')

    print("Running Video Clustering..." )
    video_cluster(document_topic_probabilities, titles, df)
    print("Calculating Topic Interdistance..." )
    topic_interdistance(topic_model, video_topics_df)
    print("Creating Data Map..." )
    data_map(topic_model, embeddings, titles)
    print("Performing Temporal Sentiment Analysis..." )
    temporal_sentiment_analysis(df)

def setup_transcript_analysis():
    df = create_transcript_db()
    print("Transcript database created with {} entries.".format(len(df)))
    print("Running BERTopic analysis...")
    run_bertopic(df)