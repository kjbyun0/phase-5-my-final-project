from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
# from sqlalchemy.sql import func
# from datetime import datetime
from config import db, bcrypt
import json
import re

from search import SearchableMixin

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    serialize_rules = (
        '-_password_hash',
        '-seller.user',
        '-seller.items.category',
        '-seller.items.seller',
        '-seller.items.cart_items',
        '-seller.items.order_items.order.customer.user',
        '-seller.items.order_items.order.customer.cart_items',
        '-seller.items.order_items.order.customer.orders',
        '-seller.items.order_items.order.customer.reviews',
        '-seller.items.order_items.order.order_items',
        '-seller.items.order_items.item',
        '-seller.items.reviews',
        '-customer.user',
        '-customer.cart_items.item.category',
        '-customer.cart_items.item.seller',
        '-customer.cart_items.item.cart_items',
        '-customer.cart_items.item.order_items',
        '-customer.cart_items.item.reviews',
        '-customer.cart_items.customer',
        '-customer.orders.customer',
        '-customer.orders.order_items.order',
        '-customer.orders.order_items.item.category',
        '-customer.orders.order_items.item.seller',
        '-customer.orders.order_items.item.cart_items',
        '-customer.orders.order_items.item.order_items',
        '-customer.orders.order_items.item.reviews',
        '-customer.reviews.item.category',
        '-customer.reviews.item.seller',
        '-customer.reviews.item.cart_items',
        '-customer.reviews.item.order_items',
        '-customer.reviews.item.reviews',
        '-customer.reviews.customer',
    )

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    email = db.Column(db.String)
    phone = db.Column(db.String)    
    street_1 = db.Column(db.String)
    street_2 = db.Column(db.String)
    city = db.Column(db.String)
    state = db.Column(db.String)
    zip_code = db.Column(db.String)

    seller = db.relationship('Seller', back_populates='user', uselist=False)
    customer = db.relationship('Customer', back_populates='user', uselist=False)

    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        # print('in models authenticate func, password: ', password)
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    @validates('username', 'password', 'email', 'phone', 'zip_code')
    def validate(self, key, value):
        if key == 'username':
            if not isinstance(value, str):
                raise TypeError('Server validation error: Invalid type for username')
            elif len(value) < 5 or len(value) > 20:
                raise ValueError('Server validation error: Invalid username')
        elif key == 'password':
            if len(value) < 5:
                raise ValueError('Server validation error: Invalid password length')
        elif key == 'email':
            email = r"[A-Za-z]+[A-Za-z0-9]*\.?[A-Za-z0-9]+@[A-Za-z_\-]+\.[A-Za-z]{2,3}"
            email_regex = re.compile(email)
            if not email_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid email address')
        elif key == 'phone':
            phone = r"((([\(]?[0-9]{3,4}[\)]\s?)|([0-9]{3,4}[\-]))[0-9]{3,4}[\-][0-9]{4})|([0-9]{10,12})"
            phone_regex = re.compile(phone)
            if not phone_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid phone number')
        elif key == 'zip_code':
            zip_code = r"[0-9]{5}"
            zip_code_regex = re.compile(zip_code)
            if not zip_code_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid zip code')

        return value

    def __repr__(self):
        return f'<User {self.id}>'


class Seller(db.Model, SerializerMixin):
    __tablename__ = 'sellers'

    serialize_rules = (
        '-user',
        '-items',
    )

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    user = db.relationship('User', back_populates='seller')
    items = db.relationship('Item', back_populates='seller', cascade='all, delete-orphan')

    @validates('name')
    def validate(self, key, value):
        if key == 'name':
            if len(value) == 0:
                raise ValueError('Server validation error: No name')
        
        return value

    def __repr__(self):
        return f'<Seller {self.id}>'


class Customer(db.Model, SerializerMixin):
    __tablename__ = 'customers'

    serialize_rules = (
        '-user',
        '-cart_items',
        '-orders',
        '-reviews',
    )

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    mobile = db.Column(db.String)
    nickname = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    user = db.relationship('User', back_populates='customer')
    cart_items = db.relationship('CartItem', back_populates='customer', cascade='all, delete-orphan')
    orders = db.relationship('Order', back_populates='customer', cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='customer', cascade='all, delete-orphan')

    items_thru_cart = association_proxy('cart_items', 'item',
                        creator=lambda item_obj: CartItem(item=item_obj))
    
    @validates('first_name', 'last_name', 'mobile')
    def validate(self, key, value):
        if key == 'first_name' or key == 'last_name':
            if len(value) == 0:
                raise ValueError(f'Server validation error: No {"first name" if key == "first_name" else "last name"}')
        elif key == 'mobile':
            mobile = r"((([\(]?[0-9]{3,4}[\)]\s?)|([0-9]{3,4}[\-]))[0-9]{3,4}[\-][0-9]{4})|([0-9]{10,12})"
            mobile_regex = re.compile(mobile)
            if not mobile_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid mobile number')
            
        return value

    def __repr__(self):
        return f'<Customer {self.id}>'


class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

    items = db.relationship('Item', back_populates='category', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Category {self.id}>'


class Item(db.Model, SerializerMixin, SearchableMixin):
    __tablename__ = 'items'
    __searchable__ = ['name', 'details_1', 'details_2', 'about_item', ]

    serialize_rules = (
        '-category',
        '-seller',
        #'-seller.user',
        # '-seller.user.seller',
        # '-seller.user.customer',
        # '-seller.items',
        '-cart_items',
        '-order_items',
        '-reviews',
    )

    id = db.Column(db.Integer, primary_key=True)
    active = db.Column(db.Integer, default=1)
    name = db.Column(db.String, nullable=False)
    brand = db.Column(db.String)
    default_item_idx = db.Column(db.Integer, nullable=False)
    prices = db.Column(db.String)   # list: price by package type
    discount_prices = db.Column(db.String)  # list: discount price by package type
    amounts = db.Column(db.String)    # list: amount by package type
    units = db.Column(db.String)    # list: unit by package type
    packs = db.Column(db.String)    # list: package type
    about_item = db.Column(db.String)   # object: item characteristics
    details_1 = db.Column(db.String)    # object: item details
    details_2 = db.Column(db.String)    # object: item details
    images = db.Column(db.String)   # list:
    accum_sales_cnt = db.Column(db.Integer, default=0)
    avg_review_rating = db.Column(db.Float, default=0)
    accum_review_cnt = db.Column(db.Integer, default=0)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))    # Removal Candidate
    seller_id = db.Column(db.Integer, db.ForeignKey('sellers.id'))

    category = db.relationship('Category', back_populates='items')
    seller = db.relationship('Seller', back_populates='items')
    cart_items = db.relationship('CartItem', back_populates='item', cascade='all, delete-orphan')
    order_items = db.relationship('OrderItem', back_populates='item', cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='item', cascade='all, delete-orphan')

    customers_thru_cart = association_proxy('cart_items', 'customer',
                            creator=lambda customer_obj : CartItem(customer=customer_obj))
    

    def validate_list(self, key, value, allowed_types):
        if not isinstance(value, list):
            raise TypeError(f'{key} must be a list.')
        elif len(value) == 0: 
            raise ValueError(f'{key} must be a non-empty list.')
        else: 
            for val in value:
                valid_type = False
                for type in allowed_types:
                    valid_type = valid_type or isinstance(val, type)
                if not valid_type:
                    raise ValueError(f'{key} must be a list of {allowed_types}.')

    @validates('name', 'prices', 'discount_prices', 'amounts', 'packs', 'units', 
        'about_item', 'details_1', 'details_2', 'images')
    def validate(self, key, value):
        if key == 'name':
            if len(value) == 0:
                raise ValueError('Name is required')
            elif len(value) > 200:
                raise ValueError("Name can't exceed more than 200 characters")
        elif key == 'prices' or key == 'discount_prices' or key == 'amounts':
            self.validate_list(key, value, [int, float])
            return json.dumps(value)
        elif key == 'packs':
            self.validate_list(key, value, [int])
            return json.dumps(value)
        elif key == 'units' or key == 'about_item':
            self.validate_list(key, value, [str])
            return json.dumps(value)
        elif key == 'details_1' or key == 'details_2': 
            self.validate_list(key, value, [str])
            for val in value:
                slist = val.split(';-;')
                if len(slist) != 2 or len(slist[0]) == 0 or len(slist[1]) == 0:
                    raise ValueError(f'{key} must be a list of key/value pair seperated by ";-;".')
            return json.dumps(value)
        elif key == 'images':
            self.validate_list(key, value, [str])
            if len(value) == 0 or len(value) > 10:
                raise ValueError(f'{key} must be a list of image links upto 10.')
            return json.dumps(value)

        return value
    
    def __repr__(self):
        return f'<Item {self.id}>'


class CartItem(db.Model, SerializerMixin):
    __tablename__ = 'cart_items'

    serialize_rules = (
        '-item.category',
        '-item.seller',
        '-item.cart_items',
        '-customer',
    )

    id = db.Column(db.Integer, primary_key=True)
    checked = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    item_idx = db.Column(db.Integer, nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))

    item = db.relationship('Item', back_populates='cart_items')
    customer = db.relationship('Customer', back_populates='cart_items')

    @validates('quantity')
    def validate(self, key, value):
        if key == 'quantity':
            if value <= 0:
                raise ValueError('Server validation error: Invalid quantity')
        
        return value

    def __repr__(self):
        return f'<CartItem {self.id}>'


class OrderItem(db.Model, SerializerMixin):
    __tablename__ = 'order_items'

    serialize_rules = (
        '-order',
        '-item',
    )

    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    processed_date = db.Column(db.DateTime)
    item_idx = db.Column(db.Integer, nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))

    # relationship
    order = db.relationship('Order', back_populates='order_items')
    item = db.relationship('Item', back_populates='order_items')

    @validates('quantity')
    def validate(self, key, value):
        if key == 'quantity':
            if value <= 0:
                raise ValueError('Server validation error: Invalid quantity')
            
        return value

    def __repr__(self):
        return f'<OrderItem {self.id}>'


class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'

    serialize_rules = (
        '-customer',
        '-order_items.order',
        '-order_items.item',
    )

    id = db.Column(db.Integer, primary_key=True)
    ordered_date = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    closed_date = db.Column(db.DateTime)
    street_1 = db.Column(db.String)
    street_2 = db.Column(db.String)
    city = db.Column(db.String)
    state = db.Column(db.String)
    zip_code = db.Column(db.String)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))

    # relationship
    customer = db.relationship('Customer', back_populates='orders')
    order_items = db.relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')

    @validates('zip_code')
    def validate(self, key, value):
        if key == 'zip_code':
            zip_code = r"[0-9]{5}"
            zip_code_regex = re.compile(zip_code)
            if not zip_code_regex.fullmatch(value):
                raise ValueError('Server validation error: Invalid zip code')

        return value
            

    def __repr__(self):
        return f'<Order {self.id}>'
    

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    serialize_rules = (
        '-item.category',
        '-item.seller',
        '-item.cart_items',
        '-item.order_items',
        '-item.reviews',
        '-customer.user', 
        '-customer.cart_items', 
        '-customer.cart_items', 
        '-customer.reviews', 
    )

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    rating = db.Column(db.Integer, nullable=False)
    headline = db.Column(db.String)
    content = db.Column(db.String)
    images = db.Column(db.String)
    review_done = db.Column(db.Integer)
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'))

    item = db.relationship('Item', back_populates='reviews')
    customer = db.relationship('Customer', back_populates='reviews')

    @validates('rating', 'review_done')
    def validate(self, key, value):
        if key == 'rating':
            if value < 1 or value > 5:
                raise ValueError('Server validation error: Invalid rating')
        elif key == 'review_done':
            if value not in [0, 1]:
                raise ValueError('Server validation error: Invalid review_done')

        return value

    def __repr__(self):
        return f'<Review {self.id}>'
