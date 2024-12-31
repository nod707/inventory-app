import os
import json
import shutil
from PIL import Image

def create_dataset_structure():
    """Create the necessary directories for the dataset"""
    base_dir = 'data/garments'
    for split in ['train', 'val', 'test']:
        os.makedirs(os.path.join(base_dir, split), exist_ok=True)

def process_image(image_path, output_path, target_size=(224, 224)):
    """Process and resize an image while maintaining aspect ratio"""
    with Image.open(image_path) as img:
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize maintaining aspect ratio
        img.thumbnail(target_size, Image.Resampling.LANCZOS)
        
        # Create new image with padding
        new_img = Image.new('RGB', target_size, (255, 255, 255))
        
        # Paste the resized image in the center
        paste_x = (target_size[0] - img.size[0]) // 2
        paste_y = (target_size[1] - img.size[1]) // 2
        new_img.paste(img, (paste_x, paste_y))
        
        # Save the processed image
        new_img.save(output_path, 'JPEG', quality=95)

def create_dataset_entry(image_path, measurements):
    """Create a dataset entry with image path and measurements"""
    return {
        'image_path': image_path,
        'measurements': measurements
    }

def prepare_dataset():
    """Main function to prepare the dataset"""
    create_dataset_structure()
    
    dataset = {
        'train': [],
        'val': [],
        'test': []
    }
    
    # Directory structure should be:
    # data/garments/
    #   ├── raw/
    #   │   ├── image1.jpg
    #   │   ├── image2.jpg
    #   │   └── ...
    #   └── measurements.json
    
    raw_dir = 'data/garments/raw'
    measurements_file = os.path.join('data/garments', 'measurements.json')
    
    # Load measurements
    with open(measurements_file, 'r') as f:
        measurements_data = json.load(f)
    
    # Process each image and split into train/val/test
    image_files = [f for f in os.listdir(raw_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    # Split ratios
    train_split = 0.7
    val_split = 0.15
    # test_split = 0.15 (remainder)
    
    train_size = int(len(image_files) * train_split)
    val_size = int(len(image_files) * val_split)
    
    # Shuffle and split
    import random
    random.shuffle(image_files)
    
    splits = {
        'train': image_files[:train_size],
        'val': image_files[train_size:train_size + val_size],
        'test': image_files[train_size + val_size:]
    }
    
    # Process images for each split
    for split_name, split_files in splits.items():
        split_dir = f'data/garments/{split_name}'
        
        for image_file in split_files:
            image_id = os.path.splitext(image_file)[0]
            if image_id not in measurements_data:
                print(f"Warning: No measurements found for {image_id}")
                continue
            
            # Process and save image
            src_path = os.path.join(raw_dir, image_file)
            dst_path = os.path.join(split_dir, image_file)
            process_image(src_path, dst_path)
            
            # Create dataset entry
            entry = create_dataset_entry(
                image_path=dst_path,
                measurements=measurements_data[image_id]
            )
            dataset[split_name].append(entry)
    
    # Save dataset splits
    for split_name, split_data in dataset.items():
        output_file = f'data/garments/{split_name}_dataset.json'
        with open(output_file, 'w') as f:
            json.dump(split_data, f, indent=2)

if __name__ == '__main__':
    prepare_dataset()
