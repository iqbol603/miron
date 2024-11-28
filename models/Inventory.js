{/* <h2>Все заказы</h2>
{orders.map((order) => (
  <div key={order._id} className="allOrders">
    <h3>Заказ ID: <br/> {order.orderId}</h3>
    <p>Клиент: {order.customer?.name || "Неизвестный клиент"}</p>
    <p>Сумма заказа: <br/> {order.totalAmount} TJS</p>

    <ul>
      <h4>Продукты:</h4>
      {order.products.map((item) => (
        <li key={item.product._id}>
          {item.product.name} - Количество: {item.quantity} - Цена: {item.product.price} TJS
        </li>
      ))}
    </ul>
    <p>Дата: <br/> {new Date(order.createdAt).toLocaleString()}</p>
    {/* <hr /> */}
//   </div> */}
// ))}