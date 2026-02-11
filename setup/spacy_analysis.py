import glob
import json
import os
import logging
import spacy
import pandas as pd
from spacy import displacy

# Load spaCy model
nlp = spacy.load('en_core_web_md')  # Large - en_core_web_lg | Medium - en_core_web_md | Small - en_core_web_sm

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

def extract_sentence_segments(doc, filename):
    segments = []
    for i, sentence in enumerate(doc.sents):
        tokens = []
        group = None

        for token in sentence: # we do this incase 2 neighboring words share an entity label. Ex: Apple Inc. -> Org
            if token.ent_iob_ == "B": # new entity
                if group:
                    tokens.append(group)
                group = {"text": token.text, "label": token.ent_type_ ,"trailing_space": token.whitespace_}

            elif token.ent_iob_ == "I" and group: # continuation
                group["text"] += group["trailing_space"] + token.text
                group["trailing_space"] = token.whitespace_

            else: # non-entity token
                if group:
                    tokens.append(group)
                    group = None
                tokens.append({"text": token.text, "label": None ,"trailing_space": token.whitespace_})

        if group:
            tokens.append(group)

        segments.append({"id": i, "tokens": tokens})

    with open(f'/materials/{filename}/{filename}_spacey.json', 'w') as f:
        f.write(json.dumps(segments))

def create_dependency_tree(doc, filename):
  os.makedirs(f"/materials/{filename}/dependency_trees", exist_ok=True)
  for i, sentence in enumerate(doc.sents):
    svg = displacy.render(sentence, style='dep', jupyter=False)
    file_name = f"/materials/{filename}/dependency_trees/{i}.svg"
    with open(file_name, "w") as f:
      f.write(svg)

def setup_spacy_analysis():
    db = collect_transcripts()
    for _, row in db.iterrows():
        doc = nlp(row['text'])
        extract_sentence_segments(doc, row['filename'])
        create_dependency_tree(doc, row['filename'])
    logging.info("spaCy analysis completed for all transcripts.")

