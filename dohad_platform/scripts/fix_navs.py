import os

files = ['frontend/analytics.html', 'frontend/team.html', 'frontend/about.html', 'frontend/news.html']

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # In analytics.html, we accidentally removed Database and added News in its place
        if f == 'analytics.html':
            if '<li><a href="news.html">News</a></li>\n                <li><a href="analytics.html"' in content:
                # restore Database
                content = content.replace('<li><a href="news.html">News</a></li>\n                <li><a href="analytics.html" class="active">Analytics</a></li>',
                                          '<li><a href="news.html">News</a></li>\n                <li><a href="database.html">Database</a></li>\n                <li><a href="analytics.html" class="active">Analytics</a></li>')
        else:
            # For the other files, insert News link after Home if missing
            home_link = '<li><a href="index.html">Home</a></li>'
            if home_link in content and '<li><a href="news.html"' not in content:
                content = content.replace(home_link, home_link + '\n                <li><a href="news.html">News</a></li>')
                
        # Make News active if on news.html
        if f == 'news.html':
            content = content.replace('href="news.html">News', 'href="news.html" class="active">News')

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print("Fixed", f)
