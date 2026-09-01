import re
import shutil
import os

files = ['frontend/database.html', 'frontend/analytics.html', 'frontend/team.html', 'frontend/about.html']
sections = []

# Extract sections from standalone pages
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We find the <section>...</section> block
    start_idx = content.find('<section')
    end_idx = content.rfind('</section>') + len('</section>')
    
    if start_idx != -1 and end_idx != -1:
        sections.append(content[start_idx:end_idx])

# Read index.html
with open('frontend/index.html', 'r', encoding='utf-8') as file:
    index_content = file.read()

# Make sure we remove old injected sections if they exist in index.html to avoid dupes
for sec_id in ['database-section', 'analytics-section', 'team-section', 'about-section']:
    # very naive removal if present
    start_sec = index_content.find(f'<section id="{sec_id}"')
    if start_sec != -1:
        end_sec = index_content.find('</section>', start_sec) + len('</section>')
        index_content = index_content[:start_sec] + index_content[end_sec:]

# Insert all sections into index.html before </main>
parts = index_content.split('</main>')
if len(parts) > 1:
    new_index = parts[0] + '\n\n' + '\n\n'.join(sections) + '\n</main>' + parts[1]
    with open('frontend/index.html', 'w', encoding='utf-8') as file:
        file.write(new_index)
    print("Updated index.html with all scrollable sections.")

# Create news.html based on about.html template
with open('frontend/about.html', 'r', encoding='utf-8') as file:
    news_template = file.read()

# Extract news section from index.html to put into news.html
news_start = index_content.find('<section id="news-section"')
news_end = index_content.find('</section>', news_start) + len('</section>')
news_section = index_content[news_start:news_end] if news_start != -1 else ""

# Replace about section with news section in news.html
about_start = news_template.find('<section')
about_end = news_template.rfind('</section>') + len('</section>')
if about_start != -1 and about_end != -1:
    news_html = news_template[:about_start] + news_section + news_template[about_end:]
    # Fix title
    news_html = news_html.replace('<title>About', '<title>News')
    with open('frontend/news.html', 'w', encoding='utf-8') as file:
        file.write(news_html)
    print("Created news.html")

# Update Navbars across all standalone files to point correctly
all_html = ['frontend/index.html', 'frontend/news.html', 'frontend/database.html', 'frontend/analytics.html', 'frontend/team.html', 'frontend/about.html']
for f in all_html:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()

        # Update News link
        content = content.replace('href="#news-section"', 'href="news.html"')
        content = content.replace('href="index.html#news-section"', 'href="news.html"')

        # Ensure active class is set appropriately
        content = re.sub(r'href="([^"]+)" class="active"', r'href="\1"', content)

        if f == 'index.html':
            content = content.replace('href="index.html"', 'href="index.html" class="active"')
        elif f == 'news.html':
            content = content.replace('href="news.html"', 'href="news.html" class="active"')
        elif f == 'database.html':
            content = content.replace('href="database.html"', 'href="database.html" class="active"')
        elif f == 'analytics.html':
            content = content.replace('href="analytics.html"', 'href="analytics.html" class="active"')
        elif f == 'team.html':
            content = content.replace('href="team.html"', 'href="team.html" class="active"')
        elif f == 'about.html':
            content = content.replace('href="about.html"', 'href="about.html" class="active"')

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("Updated navbars across all pages.")
