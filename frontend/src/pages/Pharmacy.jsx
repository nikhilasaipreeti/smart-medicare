import React, { useRef, useState } from "react";
import axios from "axios";
const Pharmacy = () => {
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef(null);

  // 🧾 Medicine list
 const medicines = [
    { id: 1, name: "Paracetamol 500mg", price: 2.5, desc: "Pain & Fever Relief", img: "https://cdn-icons-png.flaticon.com/512/2966/2966483.png" },
    { id: 2, name: "Amoxicillin 250mg", price: 3.2, desc: "Antibiotic Capsule", img: "https://cdn-icons-png.flaticon.com/512/2966/2966487.png" },
    { id: 3, name: "Cough Syrup 100ml", price: 4.8, desc: "Cold & Cough Relief", img: "https://cdn-icons-png.flaticon.com/512/4320/4320426.png" },
    { id: 4, name: "Vitamin C Tablets", price: 6.0, desc: "Immunity Booster", img: "https://cdn-icons-png.flaticon.com/512/4057/4057980.png" },
    { id: 5, name: "Pain Relief Spray", price: 5.5, desc: "Instant Pain Relief", img: "https://cdn-icons-png.flaticon.com/512/4320/4320437.png" },
    { id: 6, name: "Hand Sanitizer", price: 2.9, desc: "Kills 99.9% Germs", img: "https://cdn-icons-png.flaticon.com/512/2966/2966472.png" },
    { id: 7, name: "Diabetes Test Strips", price: 8.9, desc: "Blood Sugar Monitor", img: "https://cdn-icons-png.flaticon.com/512/2966/2966506.png" },
    { id: 8, name: "Face Mask (Pack of 5)", price: 4.0, desc: "Protective Mask", img: "https://cdn-icons-png.flaticon.com/512/2966/2966500.png" },
    { id: 9, name: "Digital Thermometer", price: 9.5, desc: "Accurate Temperature", img: "https://cdn-icons-png.flaticon.com/512/2966/2966488.png" },
    { id: 10, name: "Blood Pressure Monitor", price: 14.5, desc: "BP Monitoring Device", img: "https://cdn-icons-png.flaticon.com/512/2966/2966511.png" },
    { id: 11, name: "First Aid Kit", price: 12.0, desc: "Emergency Essentials", img: "https://cdn-icons-png.flaticon.com/512/4320/4320417.png" },
    { id: 12, name: "Pain Balm", price: 3.7, desc: "Headache & Joint Relief", img: "https://cdn-icons-png.flaticon.com/512/2966/2966507.png" },
    { id: 13, name: "Zinc Supplement", price: 5.2, desc: "Boost Immunity", img: "https://cdn-icons-png.flaticon.com/512/4057/4057978.png" },
    { id: 14, name: "Aloe Vera Gel", price: 6.3, desc: "Skin & Hair Care", img: "https://cdn-icons-png.flaticon.com/512/2966/2966477.png" },
    { id: 15, name: "Inhaler", price: 7.8, desc: "Asthma & Breathing Aid", img: "https://cdn-icons-png.flaticon.com/512/2966/2966470.png" },
    { id: 16, name: "Bandages", price: 1.9, desc: "Wound Dressing", img: "https://cdn-icons-png.flaticon.com/512/2966/2966481.png" },
    { id: 17, name: "Glucose Powder", price: 3.4, desc: "Instant Energy", img: "https://cdn-icons-png.flaticon.com/512/2966/2966485.png" },
    { id: 18, name: "Hair Oil", price: 4.1, desc: "Natural Hair Care", img: "https://cdn-icons-png.flaticon.com/512/2966/2966479.png" },
    { id: 19, name: "Eye Drops", price: 2.8, desc: "Redness & Dryness Relief", img: "https://cdn-icons-png.flaticon.com/512/2966/2966480.png" },
    { id: 20, name: "Vitamin D3 Capsules", price: 5.9, desc: "Bone Strength Supplement", img: "https://cdn-icons-png.flaticon.com/512/4057/4057982.png" },
  ];

  // 🔍 Filter medicines by search term
  const filteredMedicines = medicines.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🛒 Cart Functions
  const addToCart = (item) => {
    const newCart = { ...cart };
    if (newCart[item.id]) newCart[item.id].qty += 1;
    else newCart[item.id] = { ...item, qty: 1 };
    setCart(newCart);
    updateTotal(newCart);
  };

  const removeFromCart = (id) => {
    const newCart = { ...cart };
    delete newCart[id];
    setCart(newCart);
    updateTotal(newCart);
  };

  const updateQty = (id, qty) => {
    const newCart = { ...cart };
    if (qty <= 0) delete newCart[id];
    else newCart[id].qty = qty;
    setCart(newCart);
    updateTotal(newCart);
  };

  const updateTotal = (cartObj) => {
    const totalAmt = Object.values(cartObj).reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
    setTotal(totalAmt);
  };

  // 💳 Razorpay Payment
  const processPayment = async () => {
    if (total <= 0) return alert("Please add items to cart first!");
    setIsPaying(true);

    try {
      const { data } = await axios.post("http://localhost:8080/api/payment/create-order", {
        amount: total,
      });

      const options = {
        key: "rzp_test_RcsGI58BAiNfZP",
        amount: data.amount,
        currency: data.currency,
        name: "MediCare+ Pharmacy",
        description: "Medicine Payment",
        order_id: data.orderId,
        handler: function () {
          alert("✅ Payment Successful!");
          setPaymentDone(true);
          setCart({});
          setTotal(0);
        },
        prefill: {
          name: "MediCare User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsPaying(false);
    } catch (err) {
      console.error("❌ Razorpay Error:", err);
      alert("Payment failed. Please try again.");
      setIsPaying(false);
    }
  };

  // ⏩ Scroll buttons
  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

  // 🧩 UI
  return (
    <div className="min-h-screen bg-green-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-8">
        💊 MediCare+ Pharmacy
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Medicines Section */}
        <div className="md:col-span-2 relative">
          {/* Search Bar */}
          <div className="flex justify-between items-center mb-4 px-4">
            <input
              type="text"
              placeholder="🔍 Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-green-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Left Scroll Button */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-3 rounded-full hover:bg-green-700 z-10 shadow-lg"
          >
            ‹
          </button>

          {/* Scrollable Medicines */}
          <div ref={scrollRef} className="overflow-x-auto scroll-smooth scrollbar-hide">
            <div
              className="grid grid-cols-3 grid-rows-2 gap-6 min-w-max p-4"
              style={{ gridAutoFlow: "column", gridTemplateRows: "repeat(2, minmax(0, 1fr))" }}
            >
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white flex flex-col justify-between p-4 w-56 h-64 rounded-2xl shadow-md hover:shadow-xl transition"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-20 h-20 mx-auto object-contain"
                    />
                    <div className="text-center">
                      <h2 className="font-semibold text-lg">{item.name}</h2>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                      <p className="text-green-700 font-bold mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center col-span-6 mt-10">
                  No medicines found.
                </p>
              )}
            </div>
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-3 rounded-full hover:bg-green-700 z-10 shadow-lg"
          >
            ›
          </button>
        </div>

        {/* Cart Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-center mb-4">🛍️ Your Cart</h2>

          {Object.keys(cart).length === 0 ? (
            <p className="text-gray-500 text-center">Your cart is empty.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.values(cart).map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} × {item.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateQty(item.id, parseInt(e.target.value))
                      }
                      className="w-14 border rounded text-center"
                    />
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 text-right">
            <h3 className="text-lg font-semibold">Total: ${total.toFixed(2)}</h3>
          </div>

          <button
            onClick={processPayment}
            disabled={isPaying || total <= 0}
            className={`w-full mt-4 py-2 rounded-lg text-white ${
              isPaying || total <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isPaying ? "Processing..." : `Proceed to Pay $${total.toFixed(2)}`}
          </button>

          {paymentDone && (
            <div className="text-center mt-4">
              <button
                onClick={() => alert("🧾 Receipt Generated!")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Generate Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
