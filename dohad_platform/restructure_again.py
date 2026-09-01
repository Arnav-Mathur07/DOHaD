import os
import shutil
import glob
import re

base_dir = r"d:\College\Test DTI\dohad_platform"
os.chdir(base_dir)

# 1. Create image_generation directory
image_gen_dir = "image_generation"
os.makedirs(image_gen_dir, exist_ok=True)

# 2. Move data visualization scripts and generated files
scripts_dir = "scripts"

files_to_move = glob.glob(os.path.join(scripts_dir, "*.png")) + \
                glob.glob(os.path.join(scripts_dir, "*.html")) + \
                [os.path.join(scripts_dir, "dosage_human_world_map.py"),
                 os.path.join(scripts_dir, "dosage_world_map.py"),
                 os.path.join(scripts_dir, "organ_pie_chart_grid.py")]

for f in files_to_move:
    if os.path.exists(f):
        shutil.move(f, os.path.join(image_gen_dir, os.path.basename(f)))
        print(f"Moved {f} to {image_gen_dir}")

# 3. Update build_hybrid.py to use frontend/
build_hybrid_path = os.path.join(scripts_dir, "build_hybrid.py")
if os.path.exists(build_hybrid_path):
    with open(build_hybrid_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We want it to read from frontend/
    # Modify files = [...]
    content = content.replace("files = ['database.html', 'analytics.html', 'team.html', 'about.html']",
                              "files = ['frontend/database.html', 'frontend/analytics.html', 'frontend/team.html', 'frontend/about.html']")
    
    # index.html read/write
    content = content.replace("open('index.html',", "open('frontend/index.html',")
    content = content.replace("open('news.html',", "open('frontend/news.html',")
    content = content.replace("open('about.html',", "open('frontend/about.html',")
    
    # all_html loop
    content = content.replace("all_html = ['index.html', 'news.html', 'database.html', 'analytics.html', 'team.html', 'about.html']",
                              "all_html = ['frontend/index.html', 'frontend/news.html', 'frontend/database.html', 'frontend/analytics.html', 'frontend/team.html', 'frontend/about.html']")

    with open(build_hybrid_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated {build_hybrid_path}")

# 4. Update fix_navs.py
fix_navs_path = os.path.join(scripts_dir, "fix_navs.py")
if os.path.exists(fix_navs_path):
    with open(fix_navs_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace("files = ['analytics.html', 'team.html', 'about.html', 'news.html']",
                              "files = ['frontend/analytics.html', 'frontend/team.html', 'frontend/about.html', 'frontend/news.html']")
    
    with open(fix_navs_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated {fix_navs_path}")

# 5. Update fix_nav_order.py
fix_nav_order_path = os.path.join(scripts_dir, "fix_nav_order.py")
if os.path.exists(fix_nav_order_path):
    with open(fix_nav_order_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace("'index.html': 'Home',", "'frontend/index.html': 'Home',")
    content = content.replace("'database.html': 'Database',", "'frontend/database.html': 'Database',")
    content = content.replace("'analytics.html': 'Analysis',", "'frontend/analytics.html': 'Analysis',")
    content = content.replace("'news.html': 'News',", "'frontend/news.html': 'News',")
    content = content.replace("'team.html': 'Team',", "'frontend/team.html': 'Team',")
    content = content.replace("'about.html': 'About'", "'frontend/about.html': 'About'")

    with open(fix_nav_order_path, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated {fix_nav_order_path}")

