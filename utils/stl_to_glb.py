
import trimesh
import sys
import os

def convert(stl_path, glb_path):
    try:
        # Load mesh
        mesh = trimesh.load(stl_path)
        
        # In case it's a scene (some STLs are interpreted this way)
        if isinstance(mesh, trimesh.Scene):
            mesh = mesh.dump(concatenate=True)
            
        # Export to GLB
        mesh.export(glb_path, file_type='glb')
        print(f"Successfully converted {stl_path} to {glb_path}")
        return True
    except Exception as e:
        print(f"Conversion failed: {str(e)}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python stl_to_glb.py <input_stl> <output_glb>")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if convert(input_file, output_file):
        sys.exit(0)
    else:
        sys.exit(1)
