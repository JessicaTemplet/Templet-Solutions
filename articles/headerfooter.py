import re
import os
import glob
import shutil

def process_html_file(filepath):
    """
    Reads an HTML file, applies structural modifications for header, footer, 
    and main content containers, and saves the modified content.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at {filepath}")
        return
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    original_content = content
    
    # ------------------------------------------------------------------
    # 1. FIX HEADER: Wrap all content inside <header class="site-header"> 
    #    with <div class="container-wide"> to ensure the header's navy 
    #    background spans full width while content is constrained.
    # ------------------------------------------------------------------
    # Pattern: 
    # Group 1: Opening <header ... > tag
    # Group 2: All content between the tags (non-greedy, using DOTALL)
    # Group 3: Closing </header> tag
    header_pattern = re.compile(
        r'(<header\s+class="site-header"[^>]*>)([\s\S]*?)(<\/header>)', 
        re.IGNORECASE | re.DOTALL
    )
    
    # Replacement: \1 (opening tag) + new wrapper + \2 (content) + closing wrapper + \3 (closing tag)
    content = header_pattern.sub(
        r'\1\n    <div class="container-wide">\2    </div>\n\3', 
        content,
        count=1
    )
    
    # ------------------------------------------------------------------
    # 2. FIX FOOTER: Wrap all content inside <footer> with 
    #    <div class="container"> for the same reason as the header.
    # ------------------------------------------------------------------
    # Pattern: 
    # Group 1: Opening <footer> tag
    # Group 2: All content between the tags
    # Group 3: Closing </footer> tag
    footer_pattern = re.compile(
        r'(<footer>)([\s\S]*?)(<\/footer>)', 
        re.IGNORECASE | re.DOTALL
    )
    
    # Replacement: \1 (opening tag) + new wrapper + \2 (content) + closing wrapper + \3 (closing tag)
    content = footer_pattern.sub(
        r'\1\n    <div class="container">\2    </div>\n\3', 
        content,
        count=1
    )

    # ------------------------------------------------------------------
    # 3. FIX MAIN CONTENT: Add the 'container-narrow' class to <main> tags 
    #    that already have 'page' or 'article' but don't have 'container-narrow'.
    # ------------------------------------------------------------------
    # Pattern: 
    # Group 1: <main class="
    # Group 2: Existing class list (must contain 'page' or 'article')
    # Group 3: " (closing quote)
    # Uses a negative lookahead to ensure 'container-narrow' is NOT already present.
    main_pattern = re.compile(
        r'(<main\s+class=")([^"]*?(?:page|article)[^"]*?)(?!\s*container-narrow\s*)(")',
        re.IGNORECASE
    )
    
    # Replacement: Add ' container-narrow' to the class list
    content = main_pattern.sub(
        r'\1\2 container-narrow\3', 
        content
    )

    # Check if changes were made
    if content == original_content:
        print(f"Skipping {filepath}: No required structural changes found.")
        return

    # Write the modified content back to the original file
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Successfully updated {filepath} with new containers.")
    except Exception as e:
        print(f"Error writing to {filepath}: {e}")

def main():
    """Main execution function."""
    print("--- HTML Structure Restructuring Tool ---")
    
    # Define the file pattern to search for (e.g., all HTML files in the current directory)
    # Uses **/*.html to search recursively in all subdirectories.
    file_pattern = './**/*.html' 
    html_files = glob.glob(file_pattern, recursive=True)

    if not html_files:
        print(f"No HTML files found matching pattern: {file_pattern}")
        print("Please ensure the script is in the correct directory or adjust the 'file_pattern'.")
        return

    print(f"Found {len(html_files)} HTML files to process.")
    
    for filename in html_files:
        print(f"\nProcessing file: {filename}")
        process_html_file(filename)

    print("\n--- Processing Complete ---")

if __name__ == '__main__':
    main()