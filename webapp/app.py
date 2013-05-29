import os
from flask import Flask
from flask import render_template, Response

app = Flask(__name__)
JSON_DATA = './static/timetracker.cathy-wus-MacBook-Pro.local.json'
DEBUG = True

@app.route('/json/<data_source>')
def get(data_source):
    pass
    # with open(, 'r') as f:
    #     data = json.load(f)
    # return data

def json_response(data):
    return Response(json.dumps(data), mimetype='application/json')

@app.route('/')
def hello():
    return render_template("index.html")

if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.debug = True
    app.run(host='0.0.0.0', port=port)
