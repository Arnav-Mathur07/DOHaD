import os
import re

# We will read each HTML file in the project and update the nav-links block
files_and_active = {
    'frontend/index.html': 'Home',
    'frontend/database.html': 'Database',
    'frontend/analytics.html': 'Analysis',
    'frontend/news.html': 'News',
    'frontend/team.html': 'Team',
    'frontend/about.html': 'About'
}

order = [
    ('index.html', 'Home'),
    ('database.html', 'Database'),
    ('analytics.html', 'Analysis'),
    ('news.html', 'News'),
    ('team.html', 'Team'),
    ('about.html', 'About')
]

for filename, active_name in files_and_active.items():
    if not os.path.exists(filename):
        continue
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Generate the new ul block
    new_ul = '<ul class="nav-links">\n'
    for link_file, link_name in order:
        if link_name == active_name:
            new_ul += f'                <li><a href="{link_file}" class="active">{link_name}</a></li>\n'
        else:
            new_ul += f'                <li><a href="{link_file}">{link_name}</a></li>\n'
    
    # Notice we use the exact indention as index.html
    new_ul += '            </ul>'
    
    # We need to replace the existing <ul class="nav-links"> ... </ul> 
    # Use regex to find it
    pattern = r'<ul class="nav-links">.*?</ul>'
    new_content = re.sub(pattern, new_ul, content, flags=re.DOTALL)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Updated navbar order in {filename}')

