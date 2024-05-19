

function setUserInfo(userData, setUser, setCartItems) {
    const { customer, ...userRemaings } = userData;
    const { cart_items, ...customerRemainings } = customer ? customer : {};

    // userData can't be null because fetch operation for user data is succeeded.
    setUser({
        ...userRemaings,
        customer: Object.keys(customerRemainings).length === 0 ? null : customerRemainings,
    });
    setCartItems(cart_items === undefined ? [] : cart_items);
}

function dispPrice(item, idx) {
    // console.log('dispPrice, item: ', item);
    // console.log('dispPrice, idx: ', idx, 'type: ', typeof(idx));
    // console.log('Dollar: ', item.discount_prices[idx]);
    return (
        <>
            <span style={{fontSize: '1em', verticalAlign: '50%', }}>$</span>
            <span style={{fontSize: '2em', }}>
                {Math.floor(item.discount_prices[idx])}
            </span>
            <span style={{fontSize: '1em', verticalAlign: '50%', marginRight: '5px', }}>
                {Math.round((item.discount_prices[idx] - 
                    Math.floor(item.discount_prices[idx]))*100)}
            </span>
            <span style={{fontSize: '1em', verticalAlign: '30%', }}>
                $({Math.round(item.discount_prices[idx] / 
                    (item.amounts[idx] * item.packs[idx])*100)/100} 
                / {item.units[idx]})
            </span>
        </>
    );
}

function dispListPrice(item, idx) {
    return (
        <span><s>${item.prices[idx]}</s></span>
    );
}


async function handleCItemDelete(cartItem, cartItems, onSetCartItems) {
    console.log('in handleCItemDelete, item: ', cartItem);

    await fetch(`/cartitems/${cartItem.id}`, {
        method: 'DELETE',
    })
    .then(async r => {
        console.log('in handleCItemDelete, r: ', r);
        if (r.ok) {
            console.log('in handleCItemChange, cItem is successfully deleted.');
            onSetCartItems(cartItems => cartItems.filter(cItem => cItem.id !== cartItem.id));
        } else {
            await r.json().then(data => {
                if (r.status === 401 || r.status === 403) {
                    console.log(data);
                    alert(data.message);
                } else {
                    console.log("Server Error - Can't delete this item from cart: ", data);
                    alert(`Server Error - Can't delete this item from cart: ${data.message}`);
                }
            });
        }
    });
}

async function handleCItemAdd(cartItem, cartItems, onSetCartItems) {
    await fetch('/cartitems', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItem),
    })
    .then(async r => {
        await r.json().then(data => {
            if (r.ok) {
                console.log('In handleAddToCart fetch(POST), cartItem: ', data);
                onSetCartItems(cartItems => [
                    ...cartItems,
                    data
                ]);
            } else {
                if (r.status === 401 || r.status === 403) {
                    console.log(data);
                    alert(data.message);
                } else {
                    console.log("Server Error - Can't add an item to cart: ", data);
                    alert(`Server Error - Can't add an item to cart: ${data.message}`);
                }
            }
        });
    });
}

async function handleCItemChange(cartItem, cartItems, onSetCartItems) {
    console.log('in handleCItemChange, item: ', cartItem);

    if (cartItem.quantity === 0) {
        handleCItemDelete(cartItem);
        return;
    }

    await fetch(`/cartitems/${cartItem.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            checked: cartItem.checked,
            quantity: cartItem.quantity,
        }),
    })
    .then(async r => {
        await r.json().then(data => {
            if (r.ok) {
                console.log('in handleCItemChange, cItem: ', data);
                onSetCartItems(cartItems => cartItems.map(cItem => cItem.id === data.id ? data : cItem));
            } else {
                if (r.status === 401 || r.status === 403) {
                    console.log(data);
                    alert(data.message);
                } else {
                    console.log("Server Error - Can't patch this item in cart: ", data);
                    alert(`Server Error - Can't patch this item in cart: ${data.message}`);
                }
            }
        });
    });
}


export { setUserInfo, dispPrice, dispListPrice, handleCItemDelete, handleCItemAdd, handleCItemChange };