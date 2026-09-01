import os

html_file = 'index.html'
css_file = 'style.css'

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# The HTML to inject
diagram_html = """
                <div class="vm-image-full animate-on-scroll delay-400">
                    <div class="diagram-container">
                        <img src="vision_clean.png" alt="DOHaD scientific illustration representing environmental elements and human development">
                        
                        <!-- Left Panel Text -->
                        <div class="diagram-label left-panel" style="top: 32%; left: 4%; width: 22%;">
                            <h3>Intake and path of environmental toxicants</h3>
                            <p>Environmental toxicants, including heavy metals (Pb, Cd, Hg, As), frequently enter the pregnant mother through environmental exposure, diet, and contaminated water.</p>
                            <p>These toxic molecules enter the maternal bloodstream, travel through placental barriers, and accumulate in fetal tissue, disrupting developing physiological systems.</p>
                        </div>

                        <!-- Right Panel Text -->
                        <div class="diagram-label right-panel" style="top: 35%; right: 4%; width: 22%;">
                            <p>Environmental toxicants are heavily sourced from industrial processing, mining emissions, electronic waste, and ambient environmental dust.</p>
                            <p>The placental barrier cannot fully block the passage of these toxicants from maternal to fetal blood vessels, leading to adverse developmental outcomes and long-term health complications for the fetus.</p>
                        </div>

                        <!-- Center Annotations -->
                        <div class="diagram-label" style="top: 15%; left: 30%;">Heavy metals</div>
                        <div class="diagram-label" style="top: 15%; right: 30%;">Environmental<br>dust & Water</div>
                        
                        <div class="diagram-label" style="top: 28%; left: 52%;">Esophagus</div>
                        <div class="diagram-label" style="top: 37%; left: 60%;">Stomach</div>
                        <div class="diagram-label" style="top: 31%; left: 28%;">Intestinal wall</div>
                        <div class="diagram-label" style="top: 64%; left: 29%;">Placenta</div>
                        <div class="diagram-label" style="top: 88%; left: 61%;">Uterus</div>
                        <div class="diagram-label" style="top: 55%; left: 67%;">Umbilical cord<br>blood</div>
                    </div>
                </div>
"""

# Replace the old image block
old_block = """<div class="vm-image-full animate-on-scroll delay-400">
                    <img src="vision_wide.png"
                        alt="Abstract DOHaD scientific illustration representing environmental elements and human development">
                </div>"""

if old_block in html:
    html = html.replace(old_block, diagram_html)
else:
    # Try finding just the div
    idx = html.find('<div class="vm-image-full')
    if idx != -1:
        end_idx = html.find('</div>', html.find('</div>', idx) + 6) + 6
        html = html[:idx] + diagram_html + html[end_idx:]

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")

# Update CSS
with open(css_file, 'r', encoding='utf-8') as f:
    css = f.read()

if '.diagram-container' not in css:
    css_additions = """
/* Diagram Overlays */
.diagram-container {
    position: relative;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 12px;
}

.diagram-container img {
    width: 100%;
    height: auto;
    display: block;
}

.diagram-label {
    position: absolute;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    font-size: 0.8vw;
    line-height: 1.3;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    pointer-events: none;
}

.diagram-label.left-panel, .diagram-label.right-panel {
    font-size: 0.9vw;
    text-align: left;
}

.diagram-label h3 {
    font-size: 1.2vw;
    margin-bottom: 0.8rem;
    color: #e2e8f0;
    font-weight: 600;
}

.diagram-label p {
    margin-bottom: 0.8rem;
    color: #cbd5e1;
}

@media (max-width: 768px) {
    .diagram-label {
        font-size: 1.5vw;
    }
    .diagram-label h3 {
        font-size: 2vw;
    }
}
"""
    with open(css_file, 'a', encoding='utf-8') as f:
        f.write(css_additions)
    print("Updated style.css")
