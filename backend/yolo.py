# gets the video path
# runs segmentation and keypoints
# processes in chunks to be easier on pc 
# saves in output path 
# output -> analysis + video name [save all analysis there]

import cv2
import os

def segment():
    pass 

def pose():
    pass 

def analyze(video_path):
    cap = cv2.VideoCapture(video_path)
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    segment_writer = cv2.VideoWriter()
    pose_writer = cv2.VideoWriter()
    while True:
        ret, frame = cap.read()
        if not ret:
            break
    
        