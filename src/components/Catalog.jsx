import React, {useState, createContext, useContext, useEffect} from 'react';
import styles from './Catalog.module.css';
import productList from '../assets/data.json';
import CartIcon from '/project-assets/assets/images/icon-add-to-cart.svg?url';
import CarbonNeutralIcon from '/project-assets/assets/images/icon-carbon-neutral.svg?url';
import EmptyCartIcon from '/project-assets/assets/images/illustration-empty-cart.svg?url';
import ConfirmationIcon from "/project-assets/assets/images/icon-order-confirmed.svg?url";


productList.map((object) => {object["id"] = `#${Math.floor(Math.random() * 300000)}`});
const listsContext = createContext();

export default function Catalog() {
    const [cartList, setCartList] = useState([]);
    const [confirmOpened, setConfirmOpened] = useState(false);

    return (
        <div className={styles.catalog}>
            <div className={styles.catalogContainer}>
                <listsContext.Provider 
                    value={{
                        cartList: [cartList, setCartList], 
                        confirmOpened: [confirmOpened, setConfirmOpened]
                }}>
                    <div className={styles.products}>
                        <h1>Desserts</h1>
                        <ProductsContainer 
                            list={productList} 
                        />
                    </div>
                    <Cart />
                    <CartConfirmation />
                </listsContext.Provider>
            </div>
        </div>
    );
}



function ProductsContainer() {
    return (
        <div className={styles.productsContainer}>
            {productList.map((_, i) => <Product key={i} productIndex={i} />)}
        </div>
    );
}

function Product({productIndex}) {
    const cartList = useContext(listsContext).cartList[0];
    const setCartList = useContext(listsContext).cartList[1];

    const product = productList[productIndex];
    const cartItem = findCartItemFromProduct(cartList, product);

    let cartQty = cartItem !== "null" ? cartItem["quantity"] : "null";

    const handleAddToCart = () => {
        const newCartList = [...cartList];
        newCartList.push({"id": product["id"], "quantity": 1});
        console.log(product["id"]);

        setCartList(newCartList);
    }

    const handleIncreaseQty = () => {
        const newCartList = [...cartList];

        for (let i=0; i < cartList.length; i++) {
            if (newCartList[i]["id"] === product["id"]) {
                newCartList[i]["quantity"] = cartQty + 1;
            }
        }

        setCartList(newCartList);
    }

    const handleDecreaseQty = () => {
        const newCartList = [...cartList];
        let cartListItemIndex;
        for (let i=0; i < cartList.length; i++) {
            if (newCartList[i]["id"] === product["id"]) {
                cartListItemIndex = i;
            }
        }

        if (cartQty === 1) {
            newCartList.splice(cartListItemIndex, 1);
        } else {
            newCartList[cartListItemIndex]["quantity"] = cartQty - 1;
        }

        setCartList(newCartList);
    }
    
    return(
        <div className={styles.product} productindex={productIndex}>
            <div className={styles.imageContainer}>
                <img src={`/react-product-list/project-assets${product["image"]["desktop"]}`} />
                <div className={styles.cartBtnContainer}>
                    {(cartQty === "null") ? (
                        <AddToCartBtn func={handleAddToCart}/>
                     ) : (
                        <ProductQtySelector 
                            funcs={[handleDecreaseQty, handleIncreaseQty]} 
                            quantity={cartQty} 
                        />
                    )}
                </div>
            </div>

            <div className={styles.textContent}>
                <p className={styles.productCategory}>{product["category"]}</p>
                <p className={styles.productName}>{product["name"]}</p>
                <p className={styles.productPrice}>${formatPrice(product["price"])}</p>
            </div>
        </div>
    );
}

function AddToCartBtn({func}) {
    
    return (
        <button className={styles.addToCartBtn} onClick={func}><img src={CartIcon}/> Add To Cart</button>
    );
}

function ProductQtySelector({funcs, quantity}) {

    return (
        <div className={styles.productQtySelector}>
            <button className={`${styles.qtyBtn} ${styles.decrementBtn}`} onClick={funcs[0]}><p>–</p></button>
            <p className={styles.productQuantity}>{quantity}</p>
            <button className={`${styles.qtyBtn} ${styles.incrementBtn}`} onClick={funcs[1]}><p>+</p></button>
        </div>
    );
}



function Cart() {
    const cartList = useContext(listsContext).cartList[0];

    const confirmOpen = useContext(listsContext).confirmOpened[0];
    const setConfirmOpened = useContext(listsContext).confirmOpened[1];

    let totalCartPrice = 0;
    for (const cartItem of cartList) {
        const product = findProductFromCartItem(cartItem);
        totalCartPrice += product["price"] * cartItem["quantity"];
    }

    const handleConfirmOrder = () => {
        setConfirmOpened(true);
    }

    return (
        <div className={styles.cartListWrapper}>
            <div className={styles.cartList}>
                <h2>Your Cart ({cartList.length})</h2>
                {cartList.length === 0 ? (
                    <>
                        <img src={EmptyCartIcon} />
                        <p>Your added items will appear here</p>
                    </>
                ) : (
                    <>
                        <div className={styles.cartListContainer}>
                            {cartList.map((cartItem, i) => <CartItem key={i} item={cartItem}/>)}
                        </div>
                        <div className={styles.totalPriceContainer}>
                            <p>Order Total</p>
                            <h2 className={styles.totalCartPrice}>${formatPrice(totalCartPrice)}</h2>
                        </div>
                        <div className={styles.carbonPopup}>
                            <img src={CarbonNeutralIcon} /> 
                            <p>This is a <span>carbon-neutral</span> delivery</p>
                        </div>
                        <button className={styles.confirmOrderBtn} onClick={handleConfirmOrder}>Confirm Order</button>
                    </>  
                )}
            </div>
        </div>
    )
}

function CartItem({item}) {
    const cartList = useContext(listsContext).cartList[0];
    const setCartList = useContext(listsContext).cartList[1];
    let product = findProductFromCartItem(item);


    const handleRemoveFromCart = () => {
        const newCartList = [...cartList];

        for (let i=0; i < cartList.length; i++) {
            if (newCartList[i] === item) {
                newCartList.splice(i, 1);
            }
        }

        setCartList(newCartList);
    }

    return (
        <div className={styles.cartItem}>
            <div className={styles.cartItemContent}>
                <p className={styles.cartItemName}>{product["name"]}</p>
                <div className={styles.cartItemInfoFlex}>
                    <p className={styles.cartItemQuantity}>x{item["quantity"]}</p>
                    <p className={styles.cartItemPrice}>@ ${formatPrice(product["price"])}</p>
                    <p className={styles.cartItemTotalPrice}>${formatPrice(product["price"] * item["quantity"])}</p>
                </div>
            </div>
            <button className={styles.deleteCartItemBtn} onClick={handleRemoveFromCart}>×</button>
        </div>
    );
}

function CartConfirmation() {
    const cartList = useContext(listsContext).cartList[0];
    const setCartList = useContext(listsContext).cartList[1];

    const confirmOpen = useContext(listsContext).confirmOpened[0];
    const setConfirmOpened = useContext(listsContext).confirmOpened[1];

    let totalCartPrice = 0;
    for (const cartItem of cartList) {
        const product = findProductFromCartItem(cartItem);
        totalCartPrice += product["price"] * cartItem["quantity"];
    }

    const handleStartNewOrder = () => {
        setCartList([]);
        setConfirmOpened(false);
    }

    return (
        <div className={styles.cartConfirmation} style={confirmOpen ? {visibility: "visible", opacity: 1} : {visibility: "hidden", opacity: 0}}>
            <div className={styles.cartConfirmationContainer}>
                <img src={ConfirmationIcon} />
                <h1>Order Confirmed</h1>
                <p>We hope you enjoy your food!</p>
                <div className={styles.confirmationListContainer}>
                    <div className={styles.confirmationList}>
                        {cartList.map((item, i) => <ConfirmationItem item={item} key={i} />)}
                    </div>
                    <div className={styles.orderTotalContainer}>
                        <p>Order Total:</p>
                        <h2 className={styles.totalOrderPrice}>${formatPrice(totalCartPrice)}</h2>
                    </div>
                </div>
                <button onClick={handleStartNewOrder}>Start New Order</button>
            </div>
        </div>
    );
}

function ConfirmationItem({item}) {
    const product = findProductFromCartItem(item);

    return (
        <div className={styles.confirmationItem}>
            <div className={styles.itemInfo}>
                <img src={`/react-product-list/project-assets${product["image"]["thumbnail"]}`} />
                <div className={styles.infoTextContent}>
                    <p className={styles.cartItemName}>{product["name"]}</p>
                    <div className={styles.itemInfoFlex}>
                        <p className={styles.cartItemQuantity}>x{item["quantity"]}</p>
                        <p className={styles.cartItemPrice}>@ ${formatPrice(product["price"])}</p>
                    </div>
                </div>
            </div>
            <p className={styles.itemTotalPrice}>${formatPrice(product["price"] * item["quantity"])}</p>

        </div>
    )
}


function formatPrice(num) {
    return Number(Math.round(num * 100) / 100).toFixed(2);
}

function findCartItemFromProduct(cartList, product) {
    if (cartList.length > 0) {
        for (let i=0; i < cartList.length; i++) {
            if (cartList[i]["id"] === product["id"]) {
                return cartList[i];
            }
        }
        return "null";
    } else {
        return "null";
    }

}


function findProductFromCartItem(cartItem) {
    for (const productItem of productList) {
        if (productItem["id"] === cartItem["id"]) {
            return productItem;
        }
    }
    return {};
}