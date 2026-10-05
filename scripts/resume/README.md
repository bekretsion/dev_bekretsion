# Resume

`resume.html` is the resume. Edit it, then regenerate the files. Everything else is derived from it.

## Why it looks the way it does

Applicant tracking systems read the text of a PDF top to bottom and map it to fields. The file is built so that step can't go wrong:

- one column, no tables, no text boxes, no images;
- the standard section names parsers look for: Summary, Experience, Projects, Education, Skills;
- dates as MM/YYYY;
- name and contact details in the body of the page, never in a page header or footer;
- plain hyphens and straight quotes (some older systems mangle dashes and curly quotes);
- one page, named `Firstname-Lastname-Role.pdf`.

Keep to that when editing. Don't add a photo, a skills bar, a second column or a table.

## Regenerating the PDF the easy way

Open `resume.html` in Chrome or Edge, press Ctrl+P, and set:

- Destination: **Save as PDF**
- Paper size: **A4**
- Margins: **Default**
- Headers and footers: **off**
- Background graphics: **off**

Save it as `public/Bekretsion-Seyoum-Backend-Engineer.pdf`. That file is what `/resume` on the site redirects to, so the link never changes. Copy it to the Desktop as well if you send it from there.

Check it stayed on one page. If it spilled over, shorten a bullet; don't shrink the font below 9pt.

## Word and plain-text versions

Some portals prefer a Word file (Taleo does), and many have a "paste your resume" box. The session tooling built `Bekretsion-Seyoum-Backend-Engineer.docx` and `.txt` on the Desktop from the same HTML. If you edit the HTML, the simplest way to refresh the Word file is to open the PDF in Word (File → Open → pick the PDF; Word converts it) and save as .docx, then copy the text from the PDF into the .txt.
