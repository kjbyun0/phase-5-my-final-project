
from config import app
from models import Item

if __name__ == '__main__':
    with app.app_context():
        Item.reindex()
        # Item.del_index()
