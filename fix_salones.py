import urllib.request, urllib.parse, json

base = 'https://backend-smartcampus.onrender.com'

fixes = {
    14: 'Salon 101',
    15: 'Salon 102',
}

for sid, correct_name in fixes.items():
    with urllib.request.urlopen(f'{base}/spaces/{sid}', timeout=30) as r:
        s = json.loads(r.read())

    data = urllib.parse.urlencode({
        'building_id': s['building_id'],
        'name': correct_name,
        'capacity': s['capacity'],
        'status': s['status'],
        'category': s.get('category') or '',
        'floor': s.get('floor') or '',
        'image_url': '',
        'is_active': 'true' if s.get('is_active', True) else 'false'
    }).encode('ascii')

    req = urllib.request.Request(f'{base}/spaces/{sid}', data=data, method='PUT')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    with urllib.request.urlopen(req, timeout=30) as r2:
        result = json.loads(r2.read())

    with urllib.request.urlopen(f'{base}/spaces/{sid}', timeout=30) as r3:
        updated = json.loads(r3.read())
    print(f"ID {sid}: nombre ahora = {repr(updated['name'])}")
