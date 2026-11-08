from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote
import json
import re

ROOT = Path(__file__).resolve().parent


def clean(value):
    return re.sub(r'\s+', ' ', value).strip()


class Content(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.title = False
        self.titles = []
        self.text = []
        self.row = None
        self.topic = False
        self.lectures = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'nav', 'footer', 'nav-component', 'footer-component'):
            self.skip += 1
        if tag == 'title':
            self.title = True
        if tag == 'tr' and attrs.get('id', '').startswith('lecture-'):
            self.row = {'id': attrs['id'], 'text': [], 'title': []}
        if self.row is not None and tag == 'a' and 'topic-link' in attrs.get('class', '').split():
            self.topic = True

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'nav', 'footer', 'nav-component', 'footer-component') and self.skip:
            self.skip -= 1
        if tag == 'title':
            self.title = False
        if tag == 'a':
            self.topic = False
        if tag == 'tr' and self.row is not None:
            self.lectures.append(self.row)
            self.row = None

    def handle_data(self, data):
        if self.title:
            self.titles.append(data)
        elif not self.skip:
            self.text.append(data)
        if self.row is not None:
            self.row['text'].append(data)
            if self.topic:
                self.row['title'].append(data)


entries = []
for path in sorted(ROOT.rglob('*.html')):
    if any(part.startswith('.') for part in path.relative_to(ROOT).parts):
        continue
    parser = Content()
    parser.feed(path.read_text(encoding='utf-8'))
    url = quote(path.relative_to(ROOT).as_posix(), safe='/')
    title = clean(' '.join(parser.titles)) or path.stem
    body = clean(' '.join(parser.text)) or title
    entries.append({'title': title, 'url': url, 'text': body})
    for lecture in parser.lectures:
        entries.append({
            'title': clean(' '.join(lecture['title'])),
            'url': url + '#' + quote(lecture['id']),
            'text': 'Learning Center: ' + clean(' '.join(lecture['text'])),
        })
(ROOT / 'search-index.json').write_text(json.dumps(entries, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
print(f'Indexed {len(entries)} pages and lecture entries')
