import os
from huggingface_hub import HfApi, login
from dotenv import load_dotenv

def main():
    print("🚀 Hugging Face Model Uploader\n")
    
    # 1. Get Token from .env securely
    load_dotenv()
    token = os.getenv("HF_TOKEN")
    
    if not token or token == "your_hugging_face_token_here":
        print("❌ Error: Please paste your Hugging Face Token in the backend/.env file first!")
        return

    try:
        login(token=token)
        print("✅ Logged in successfully using token from .env file!\n")
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return

    # 2. Get local folder path
    local_folder = input("2. Enter the path to your local adapter folder (e.g., C:/Users/.../adapter): ").strip()
    if not os.path.exists(local_folder):
        print(f"❌ The folder '{local_folder}' does not exist.")
        return

    # 3. Get Repository Name
    repo_id = input("3. Enter the Hugging Face Repo ID to create/upload to (e.g., your-username/car-specialist-gemma-lora): ").strip()

    # 4. Upload
    api = HfApi()
    print(f"\n⏳ Creating repository '{repo_id}' (if it doesn't exist)...")
    try:
        api.create_repo(repo_id=repo_id, exist_ok=True)
    except Exception as e:
        print(f"❌ Failed to create repo: {e}")
        return

    print(f"⬆️ Uploading files from '{local_folder}' to '{repo_id}'...")
    try:
        api.upload_folder(
            folder_path=local_folder,
            repo_id=repo_id,
            repo_type="model",
        )
        print("\n🎉 Upload Complete!")
        print(f"🔗 Your model is now live at: https://huggingface.co/{repo_id}")
        print("\n👉 Next Steps:")
        print(f"1. Copy '{repo_id}' into your backend/.env file as HF_MODEL_ID")
        print("2. Copy your HF Token into backend/.env as HF_TOKEN")
    except Exception as e:
        print(f"❌ Upload failed: {e}")

if __name__ == "__main__":
    main()
