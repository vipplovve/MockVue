import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import cv2
import numpy as np
from deepface import DeepFace
import mediapipe as mp
import sys
import time

class PoseEmotionEvaluator:
    def __init__(self):
        self.pose_detector = mp.solutions.pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        self.face_analyzer = mp.solutions.face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)

    def evaluate_image(self, image):
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pose_output = self.pose_detector.process(rgb_image)
            face_output = self.face_analyzer.process(rgb_image)

            emotion_analysis = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False, silent=True)
            if not emotion_analysis or not isinstance(emotion_analysis, list):
                return None

            emotion_scores = emotion_analysis[0]["emotion"]

            pose_quality = self.score_posture(pose_output.pose_landmarks)
            confidence_estimate = self.score_confidence(face_output.multi_face_landmarks, emotion_scores)
            weighted_score = (
                pose_quality * 0.4 +
                confidence_estimate * 0.4 +
                (emotion_scores.get("happy", 0) + emotion_scores.get("neutral", 0)) * 0.2
            ) / 100

            return round(weighted_score * 10, 2)

        except Exception:
            return None

    def score_posture(self, keypoints):
        if not keypoints:
            return 0
        try:
            left_shoulder = np.array([keypoints.landmark[11].x, keypoints.landmark[11].y])
            right_shoulder = np.array([keypoints.landmark[12].x, keypoints.landmark[12].y])
            nose_tip = np.array([keypoints.landmark[0].x, keypoints.landmark[0].y])

            slope = abs((right_shoulder[1] - left_shoulder[1]) / (right_shoulder[0] - left_shoulder[0] + 1e-6))
            shoulder_alignment = max(0, 1 - slope * 5)

            mid_shoulder_x = (left_shoulder[0] + right_shoulder[0]) / 2
            head_alignment = abs(nose_tip[0] - mid_shoulder_x)
            head_alignment_score = max(0, 1 - head_alignment * 10)

            return (shoulder_alignment * 0.6 + head_alignment_score * 0.4) * 100
        except:
            return 0

    def score_confidence(self, facial_points, emotion_values):
        if not facial_points:
            return 0
        try:
            emotion_weight = (
                emotion_values.get('happy', 0) * 1.0 +
                emotion_values.get('neutral', 0) * 0.7 -
                emotion_values.get('fear', 0) * 0.8 -
                emotion_values.get('sad', 0) * 0.6 -
                emotion_values.get('disgust', 0) * 0.5 -
                emotion_values.get('angry', 0) * 0.3
            ) / 100
            confidence_value = max(0, min(1, 0.5 + emotion_weight))
            return confidence_value * 100
        except:
            return 0


if __name__ == "__main__":
    session_id = sys.argv[1]
    input_directory = f"uploads\\{session_id}"
    processed_images = set()
    evaluator = PoseEmotionEvaluator()
    scores = []
    try:
        while True:
            images_to_process = [
                filename for filename in os.listdir(input_directory)
                if filename.lower().endswith((".jpg", ".jpeg", ".png")) and filename not in processed_images
            ]
            for image_name in sorted(images_to_process):
                image_path = os.path.join(input_directory, image_name)
                frame_data = cv2.imread(image_path)
                if frame_data is not None:
                    result_score = evaluator.evaluate_image(frame_data)
                    if result_score is not None:
                        scores.append(result_score)
                processed_images.add(image_name)
            mean_score = round(sum(scores) / len(scores), 2) if scores else 0.0
            print(f"{mean_score}", flush=True)
            time.sleep(1)
    except KeyboardInterrupt:
        print("Process terminated.")
