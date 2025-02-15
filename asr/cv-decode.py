import os
import csv
from concurrent.futures import ProcessPoolExecutor
from models.wav2vec2_model import Wav2Vec2Model
import requests
# import speechbrain as sb
from tqdm import tqdm
import signal

# Initialise the ASR model
# asr_model = Wav2Vec2Model()


# Load pre-trained models for age, gender, and accent
# age_model = sb.pretrained.EncoderClassifier.from_hparams(source="speechbrain/spkrec-xvect-voxceleb", savedir="tmp/xvect-age")
# gender_model = sb.pretrained.EncoderClassifier.from_hparams(source="speechbrain/spkrec-xvect-voxceleb", savedir="tmp/xvect-gender")
# accent_model = sb.pretrained.EncoderClassifier.from_hparams(source="speechbrain/spkrec-xvect-voxceleb", savedir="tmp/xvect-accent"
                                                            
def infer_speaker_attributes(audio_file):
    # age = age_model.classify_file(audio_file).string()
    # gender = gender_model.classify_file(audio_file).string()
    # accent = accent_model.classify_file(audio_file).string()
    # return age, gender, accent
    return "NULL", "NULL", "NULL"

def transcribe_file(file_path):
    file_id = os.path.basename(file_path).split('.')[0]
    # try: # local hack
    #     # Read and process the audio file
    #     speech, sr = librosa.load(file_path, sr=16000)
    #     duration = len(speech) / sr
    #     # transcribe!
    #     transcription = asr_model.transcribe(speech)
    #     # Get other inferred attributes WIP
    #     age, gender, accent = infer_speaker_attributes(file_path)
    #     # print(f"file_id: {file_id}, transcription: {transcription}")
    #     return file_id, transcription, duration, age, gender, accent, "None"
    try:
        with open(file_path, 'rb') as f:
            response = requests.post("http://localhost:8000/asr", files={"file": f})
        response.raise_for_status()  # Raise an error if the request failed
        data = response.json()
        transcription = data.get("transcription")
        duration = float(data.get("duration", "0"))
        # Placeholder values for additional attributes, if needed:
        age, gender, accent = "NULL", "NULL", "NULL"
        return file_id, transcription, duration, age, gender, accent, "None"
    except Exception as e:
        # Capture the error and return it along with file_id
        return file_id, None, None, None, None, None, str(e)


def batch_transcribe(audio_dir, max_workers=None, delete_file = False):
    """
    This function performs batch transcribe using multiprocessing, given max_workers
    This will produce a csv of output and also all failed transcription work will be in a errors.csv for investigation

    if csv exists then will not retranscribe existing ids, instead will continue with other new ids! 
    """
    # Determine output CSV file name based on directory name
    output_csv = f"{os.path.basename(os.path.normpath(audio_dir))}.csv"
    
    # Get list of audio files in the directory
    audio_files = [os.path.join(audio_dir, f) for f in os.listdir(audio_dir) if f.endswith('.mp3')]
    
    # Check if output CSV already exists
    existing_records = {}
    if os.path.exists(output_csv):
        with open(output_csv, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing_records[row['id']] = row

    # Set up output CSV
    fieldnames = ['id', 'generated_text', 'duration', 'age', 'gender', 'accent', 'error']

    with open(output_csv, 'a', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        
        # Write headers only if the file is new
        if not existing_records:
            writer.writeheader()
        
        # Filter audio files to process only new or errored files
        files_to_process = [f for f in audio_files if os.path.basename(f).split('.')[0] not in existing_records or existing_records[os.path.basename(f).split('.')[0]]['error'] != 'None']
        
        # Use ProcessPoolExecutor with the specified number of workers
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            # Use tqdm to show progress bar
            with tqdm(total=len(files_to_process), desc="Processing files") as pbar:
                results = executor.map(transcribe_file, files_to_process)
                for result in results:

                    file_id = result[0]
                    # Successful transcription
                    transcription, duration, age, gender, accent, error = result[1:7]
                    writer.writerow({
                        'id': file_id, 
                        'generated_text': transcription, 
                        'duration': f"{duration:.1f}", 
                        'age': age, 
                        'gender': gender, 
                        'accent': accent, 
                        'error':error
                    })
                    if delete_file:
                        # Delete the successfully processed audio file
                        os.remove(os.path.join(audio_dir, f"{file_id}.mp3"))

                    
                    pbar.update(1)

if __name__ == "__main__":
    batch_transcribe('D:/data/cv-valid-dev/cv-valid-dev', max_workers=8)
                    