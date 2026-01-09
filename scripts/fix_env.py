import os

def sanitize_env():
    env_path = '.env'
    if not os.path.exists(env_path):
        print(".env not found")
        return

    try:
        with open(env_path, 'rb') as f:
            content = f.read()
        
        # Decode ignoring errors to strip garbage
        text = content.decode('utf-8', errors='ignore')
        
        # Remove BOM
        if text.startswith(u'\ufeff'):
            text = text[1:]
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
            
        print("Sanitized .env file successfully.")
        print("Content preview:")
        print('\n'.join(lines))
        
    except Exception as e:
        print(f"Error sanitizing .env: {e}")

if __name__ == "__main__":
    sanitize_env()
