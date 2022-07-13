import { useContext, useState } from "react";
import Modal from "../UI/Modal";
import CartItem from "./CartItem";
import classes from "./Cart.module.css";
import CartContext from "../../store/cart-context";
import Checkout from "./Checkout";
const Cart = (props) => {
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(false);
  const [error, setError] = useState(false);
  const [placed, setPlaced] = useState(false);
  const cartCtx = useContext(CartContext);

  const totalAmount = `$${cartCtx.totalAmount.toFixed(2)}`;
  const hasItems = cartCtx.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartCtx.removeItem(id);
  };

  const cartItemAddHandler = (item) => {
    cartCtx.addItem(item);
  };

  const orderHandler = (e) => {
    setOrder(true);
  };

  async function submitHandler(userData) {
    try {
      setSubmitting(true);
      const response = await fetch(
        "https://react-http-5df00-default-rtdb.firebaseio.com/orders.json",
        {
          method: "POST",
          body: JSON.stringify({
            user: userData,
            orderedItems: cartCtx.items,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("something is wrong");
      }
    } catch (error) {
      setError(error.message);
    }
    setSubmitting(false);
    setPlaced(true);
  }

  if (error) {
    return (
      <section>
        <p>{error}</p>
      </section>
    );
  }

  const cartItems = (
    <ul className={classes["cart-items"]}>
      {cartCtx.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const modal = (
    <>
      {cartItems}
      <div className={classes.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>
      {order && <Checkout onConfirm={submitHandler} onClose={props.onClose} />}
      {!order && (
        <div className={classes.actions}>
          <button className={classes["button--alt"]} onClick={props.onClose}>
            Close
          </button>
          {hasItems && (
            <button onClick={orderHandler} className={classes.button}>
              Order
            </button>
          )}
        </div>
      )}
    </>
  );

  const isSubmitting = <p> submitting... </p>;
  const placedOrder = <p>Placed ...</p>;

  if (placed) {
    cartCtx.clearCart();
  }

  return (
    <Modal onClose={props.onClose}>
      {!submitting && !placed && modal}
      {submitting && !placed && isSubmitting}
      {!submitting && placed && placedOrder}
    </Modal>
  );
};

export default Cart;
