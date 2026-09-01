import os

files = ['index.html', 'news.html']

old_header_1 = """<div class="section-header animate-on-scroll">
                <h2>Latest Research & News</h2>
                <p>Live feed of recently published DOHaD studies via CrossRef.</p>
            </div>"""

old_header_2 = """<div class="section-header animate-on-scroll">
                <h2>Latest Research & News</h2>
                <p>Live feed of top US health and medical headlines.</p>
            </div>"""

new_header = """<div class="section-header animate-on-scroll" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
                <div style="text-align: left;">
                    <h2 style="margin-bottom: 0.5rem;">Latest Research & News</h2>
                    <p style="margin: 0; color: var(--text-muted);">Live feed of top US health and medical headlines.</p>
                </div>
                <button id="refresh-news-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; cursor: pointer;">
                    <i class="fa-solid fa-rotate-right"></i> Refresh News
                </button>
            </div>"""

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        modified = False
        if old_header_1 in content:
            content = content.replace(old_header_1, new_header)
            modified = True
            
        if not modified:
            # Maybe the header format is slightly different, let's just replace the exact tags
            idx = content.find('<h2>Latest Research & News</h2>')
            if idx != -1:
                start_div = content.rfind('<div', 0, idx)
                end_div = content.find('</div>', idx) + 6
                # Extract the old matched block for safety
                old_block = content[start_div:end_div]
                if '<div' in old_block and 'Latest Research & News' in old_block:
                    content = content[:start_div] + new_header + content[end_div:]
                    modified = True
                    
        if modified:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            print("Successfully updated", f)
        else:
            print("Could not find the target section in", f)
