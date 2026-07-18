"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { useCart } from "../../components/cart-provider";
import { fetchCurrentCustomer, fetchCustomerAddresses, getStoredCustomerToken, storeCustomerToken } from "../../lib/customer-auth";
import { fetchPincodeLocation, formatIndianPhone, isValidEmailInput, isValidIndianPhone, normalizeEmailInput, normalizeIndianPhone, normalizeIndianPincode } from "../../lib/form-inputs";
import { getActiveCoupons, getSettings, getProducts, placeOrder, formatPrice, resolveAssetUrl, verifyPayment, cancelOrder } from "../../lib/api";
import { Coupon, CustomerAddress, CustomerUser, PaymentGatewayPublic, Product, SiteSettings } from "../../lib/types";

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).Razorpay) {
    return true;
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Tirupati", "Rajamahendravaram", "Kakinada", "Kadapa", "Anantapur",
    "Eluru", "Vizianagaram", "Other"
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Namsai", "Other"],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Bongaigaon", "Tezpur", "Other"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia",
    "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Other"
  ],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Other"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Other"],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Morbi", "Nadiad", "Other"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Other"
  ],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Bilaspur", "Kullu", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Other"],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi",
    "Davanagere", "Ballari", "Tumakuru", "Shivamogga", "Kalaburagi", "Udupi", "Other"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Other"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Other"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad",
    "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai",
    "Solapur", "Kolhapur", "Amravati", "Other"
  ],
  "Manipur": ["Imphal", "Thoubal", "Kakching", "Other"],
  "Meghalaya": ["Shillong", "Tura", "Nongpoh", "Other"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Other"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Other"],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
    "Udaipur", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Other"
  ],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Other"],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem",
    "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Tirunelveli", "Other"
  ],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Other"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Other"],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut",
    "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad",
    "Noida", "Greater Noida", "Gorakhpur", "Jhansi", "Firozabad", "Other"
  ],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Other"],
  "West Bengal": [
    "Kolkata", "Howrah", "Siliguri", "Asansol", "Durgapur",
    "Bardhaman", "Malda", "Kharagpur", "Jalmaiguri", "Other"
  ],
  "Andaman and Nicobar Islands": ["Port Blair", "Other"],
  "Chandigarh": ["Chandigarh", "Other"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa", "Other"],
  "Delhi": ["New Delhi", "Delhi", "Noida (NCR)", "Gurugram (NCR)", "Ghaziabad (NCR)", "Faridabad (NCR)", "Other"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Other"],
  "Ladakh": ["Leh", "Kargil", "Other"],
  "Lakshadweep": ["Kavaratti", "Other"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam", "Other"]
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart } = useCart();
  const checkoutCompletingRef = useRef(false);

  // User & settings states
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [shippingProducts, setShippingProducts] = useState<Record<number, Product>>({});

  // Online gateway simulation overlay state
  const [activeSimulation, setActiveSimulation] = useState<{
    orderNumber: string;
    amount: number;
    method: "razorpay" | "phonepe";
    accessToken?: string | null;
  } | null>(null);

  // Form states
  const [shipName, setShipName] = useState("");
  const [shipEmail, setShipEmail] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAltPhone, setShipAltPhone] = useState("");
  const [shipAddressLine1, setShipAddressLine1] = useState("");
  const [shipAddressLine2, setShipAddressLine2] = useState("");
  const [shipLandmark, setShipLandmark] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPincode, setShipPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay" | "phonepe">("razorpay");
  const [notes, setNotes] = useState("");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false);
  const [saveAddressAsDefault, setSaveAddressAsDefault] = useState(false);
  const [saveAddressType, setSaveAddressType] = useState<"home" | "office" | "other">("home");
  const [saveAddressLabel, setSaveAddressLabel] = useState("");

  // Dropdown list helper states
  const [customCityActive, setCustomCityActive] = useState(false);
  const [customCityValue, setCustomCityValue] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const pincodeLookupRef = useRef<string>("");

  const handleStateChange = (stateVal: string) => {
    setShipState(stateVal);
    setShipCity("");
    setCustomCityActive(false);
    setCustomCityValue("");
  };

  const handleCityChange = (cityVal: string) => {
    if (cityVal === "Other") {
      setCustomCityActive(true);
      setShipCity("");
      setCustomCityValue("");
    } else {
      setCustomCityActive(false);
      setShipCity(cityVal);
      setCustomCityValue("");
    }
  };

  const handleCustomCityChange = (val: string) => {
    setCustomCityValue(val);
    setShipCity(val);
  };

  const applyPincodeLocation = (state: string, city: string) => {
    setShipState(state);
    if (state && INDIAN_STATES_AND_CITIES[state]?.includes(city)) {
      setCustomCityActive(false);
      setCustomCityValue("");
      setShipCity(city);
      return;
    }

    setCustomCityActive(true);
    setCustomCityValue(city);
    setShipCity(city);
  };

  const composeShippingAddress = () =>
    [shipAddressLine1.trim(), shipAddressLine2.trim(), shipLandmark.trim()]
      .filter(Boolean)
      .join(", ");

  const applySavedAddress = (address: CustomerAddress) => {
    setSelectedAddressId(address.id);
    setShipName(address.recipient_name || user?.name || "");
    setShipEmail(user?.email || shipEmail);
    setShipPhone(address.phone || user?.phone || "");
    setShipAltPhone(address.alternate_phone || "");
    setShipAddressLine1(address.address_line1 || "");
    setShipAddressLine2(address.address_line2 || "");
    setShipLandmark(address.landmark || "");
    setShipPincode(normalizeIndianPincode(address.pincode || ""));
    applyPincodeLocation(address.state || "", address.city || "");
    setSaveAddressType(address.type || "home");
    setSaveAddressLabel(address.label || "");
    setSaveAddressAsDefault(address.is_default);
  };

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableGateways = settings
    ? (settings.payment_gateways || [])
    : [{ provider: "cod", display_name: "Cash on Delivery", is_test_mode: false } satisfies PaymentGatewayPublic];
  const hasAnyPaymentGateway = availableGateways.length > 0;
  const hasGateway = (provider: "cod" | "razorpay" | "phonepe") =>
    availableGateways.some((gateway) => gateway.provider === provider);
  const gatewayMeta = (provider: "cod" | "razorpay" | "phonepe") =>
    availableGateways.find((gateway) => gateway.provider === provider);

  const redirectToSuccess = (orderNumber: string) => {
    const target = `/checkout/success?order_number=${encodeURIComponent(orderNumber)}`;
    if (typeof window !== "undefined") {
      window.location.assign(target);
      return;
    }
    router.push(target);
  };

  const redirectToFailure = (params: {
    orderNumber?: string;
    paymentMethod?: string;
    reason?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.orderNumber) query.set("order_number", params.orderNumber);
    if (params.paymentMethod) query.set("payment_method", params.paymentMethod);
    if (params.reason) query.set("reason", params.reason);
    const target = `/checkout/failed${query.toString() ? `?${query.toString()}` : ""}`;
    if (typeof window !== "undefined") {
      window.location.assign(target);
      return;
    }
    router.push(target);
  };

  // Load configuration & user data
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsData, couponsData] = await Promise.all([
          getSettings(),
          getActiveCoupons()
        ]);
        setSettings(settingsData);
        setCoupons(couponsData || []);

        const token = getStoredCustomerToken();
        if (token) {
          try {
            const [customer, addresses] = await Promise.all([
              fetchCurrentCustomer(token),
              fetchCustomerAddresses(token)
            ]);
            setUser(customer);
            setSavedAddresses(addresses);
            // Pre-fill shipping info from authenticated user
            setShipName(customer.name || "");
            setShipEmail(customer.email || "");
            setShipPhone(customer.phone || "");
            const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
            if (defaultAddress) {
              applySavedAddress(defaultAddress);
            }
          } catch (e) {
            console.error("Auth fetch failed in checkout:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load initial checkout data:", err);
      } finally {
        setLoadingConfig(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "little-divinity-customer-token" && !event.newValue) {
        setUser(null);
        setSavedAddresses([]);
        setSelectedAddressId(null);
        setShipName("");
        setShipEmail("");
        setShipPhone("");
        setShipAltPhone("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (!loadingConfig && items.length === 0 && !checkoutCompletingRef.current) {
      router.push("/cart");
    }
  }, [items, loadingConfig, router]);

  useEffect(() => {
    if (!hasGateway(paymentMethod)) {
      const fallbackMethod = (["razorpay", "phonepe", "cod"] as const).find((provider) => hasGateway(provider));
      if (fallbackMethod) {
        setPaymentMethod(fallbackMethod);
      }
    }
  }, [paymentMethod, settings]);

  useEffect(() => {
    const requestedPayment = searchParams.get("payment");

    if (requestedPayment === "cod" || requestedPayment === "razorpay" || requestedPayment === "phonepe") {
      if (hasGateway(requestedPayment)) {
        setPaymentMethod(requestedPayment);
      }
    }
  }, [searchParams, settings]);

  useEffect(() => {
    async function loadShippingProducts() {
      if (!items.length) {
        setShippingProducts({});
        return;
      }

      const ids = Array.from(new Set(items.map((item) => item.id))).filter(Boolean);

      try {
        const response = await getProducts(`ids=${ids.join(",")}&per_page=${ids.length}`);
        const productMap = response.items.reduce<Record<number, Product>>((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setShippingProducts(productMap);
      } catch (error) {
        console.error("Failed to load product shipping rules:", error);
        setShippingProducts({});
      }
    }

    loadShippingProducts();
  }, [items]);

  useEffect(() => {
    const normalizedPincode = normalizeIndianPincode(shipPincode);

    if (normalizedPincode.length !== 6 || normalizedPincode === pincodeLookupRef.current) {
      if (normalizedPincode.length < 6) {
        setPincodeStatus(null);
      }
      return;
    }

    let active = true;
    pincodeLookupRef.current = normalizedPincode;
    setPincodeStatus("Looking up city and state from pincode…");

    fetchPincodeLocation(normalizedPincode)
      .then((location) => {
        if (!active) {
          return;
        }

        applyPincodeLocation(location.state, location.city);
        setPincodeStatus("City and state auto-filled from pincode.");
      })
      .catch((err) => {
        if (!active) {
          return;
        }

        setPincodeStatus(err instanceof Error ? err.message : "Unable to auto-fill city/state right now.");
      });

    return () => {
      active = false;
    };
  }, [shipPincode]);

  if (loadingConfig || items.length === 0) {
    return (
      <main className="content-section auth-page" style={{ justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Little Divinity</p>
          <h2 className="auth-title">Preparing your secure checkout…</h2>
          <p className="auth-muted">Loading product availability, shipping parameters and user profile.</p>
        </div>
      </main>
    );
  }

  const currencySymbol = settings?.site_currency_symbol || "₹";
  const defaultShippingCost = Number(settings?.default_shipping_cost || 99);
  const freeShippingThreshold = Number(settings?.min_order_free_shipping || 499);
  const shipEmailInvalid = shipEmail.length > 0 && !isValidEmailInput(shipEmail);
  const shipPhoneInvalid = shipPhone.length > 0 && !isValidIndianPhone(shipPhone);

  // Compute subtotal, discount, shipping, and total amount
  let discountAmount = 0;
  if (appliedCoupon) {
    const minSpend = Number(appliedCoupon.min_order_amount || 0);
    if (subtotal >= minSpend) {
      if (appliedCoupon.type === "percent") {
        discountAmount = subtotal * (Number(appliedCoupon.value) / 100);
      } else {
        discountAmount = Number(appliedCoupon.value);
      }
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }
  }

  const netSubtotal = subtotal - discountAmount;
  let customShippingCost = 0;
  let hasDefaultShippingItem = false;
  let hasCustomShippingItem = false;
  let hasFreeShippingItem = false;

  items.forEach((item) => {
    const shippingProduct = shippingProducts[item.id];
    const shippingType = shippingProduct?.shipping_type || "default";

    if (shippingType === "custom") {
      hasCustomShippingItem = true;
      customShippingCost += Number(shippingProduct?.shipping_fee || 0) * item.quantity;
      return;
    }

    if (shippingType === "free") {
      hasFreeShippingItem = true;
      return;
    }

    hasDefaultShippingItem = true;
  });

  const defaultRuleShippingCost = hasDefaultShippingItem && netSubtotal < freeShippingThreshold ? defaultShippingCost : 0;
  const shippingCost = defaultRuleShippingCost + customShippingCost;
  const grandTotal = netSubtotal + shippingCost;
  const onlyCustomShipping = hasCustomShippingItem && !hasDefaultShippingItem;
  const mixedShippingRules = hasCustomShippingItem && hasDefaultShippingItem;
  const showDefaultShippingUpsell = hasDefaultShippingItem && !hasCustomShippingItem && defaultRuleShippingCost > 0;
  const checkoutIntro = onlyCustomShipping
    ? "Complete your order below. This cart includes product-specific delivery charges."
    : mixedShippingRules
      ? "Complete your order below. Standard free-shipping rules apply only to regular-delivery items in this cart."
      : `Complete your order below. Free shipping is automatically applied to orders above ${formatPrice(freeShippingThreshold, currencySymbol)}.`;

  // Handle coupon application
  function handleApplyCoupon(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const matched = coupons.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (!matched) {
      setCouponError(`The coupon code "${couponCode}" is invalid or expired.`);
      return;
    }

    const minSpend = Number(matched.min_order_amount || 0);
    if (subtotal < minSpend) {
      setCouponError(`This coupon requires a minimum spend of ${formatPrice(minSpend, currencySymbol)}.`);
      return;
    }

    setAppliedCoupon(matched);
    setCouponSuccess(`Coupon "${matched.code}" applied successfully!`);
  }

  // Handle coupon removal
  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  }

  // Simulation modal handlers
  async function handleConfirmSimulation() {
    if (!activeSimulation) return;
    setIsSubmitting(true);
    const token = getStoredCustomerToken() || undefined;

    try {
      const verifyRes = await verifyPayment({
        order_number: activeSimulation.orderNumber,
        payment_method: activeSimulation.method,
        access_token: activeSimulation.accessToken || undefined,
        razorpay_payment_id: activeSimulation.method === "razorpay" ? "pay_simulated_" + Math.random().toString(36).substring(7) : undefined,
        transaction_id: activeSimulation.method === "phonepe" ? "txn_simulated_" + Math.random().toString(36).substring(7) : undefined,
      }, token);

      if (verifyRes.success) {
        checkoutCompletingRef.current = true;
        clearCart();
        redirectToSuccess(activeSimulation.orderNumber);
      } else {
        redirectToFailure({
          orderNumber: activeSimulation.orderNumber,
          paymentMethod: activeSimulation.method,
          reason: verifyRes.message || "Payment verification failed.",
        });
        setIsSubmitting(false);
        setActiveSimulation(null);
      }
    } catch (err) {
      redirectToFailure({
        orderNumber: activeSimulation.orderNumber,
        paymentMethod: activeSimulation.method,
        reason: "An error occurred during payment verification.",
      });
      setIsSubmitting(false);
      setActiveSimulation(null);
    }
  }

  async function handleCancelSimulation() {
    if (!activeSimulation) return;
    setIsSubmitting(true);
    const token = getStoredCustomerToken() || undefined;

    try {
      const cancelRes = await cancelOrder(activeSimulation.orderNumber, token, activeSimulation.accessToken || undefined);
      redirectToFailure({
        orderNumber: activeSimulation.orderNumber,
        paymentMethod: activeSimulation.method,
        reason: cancelRes.success
          ? "Payment was cancelled before completion. You can retry from checkout."
          : cancelRes.message || "We could not cancel this payment session automatically.",
      });
    } catch (err) {
      console.error("Order cancellation failed:", err);
      redirectToFailure({
        orderNumber: activeSimulation.orderNumber,
        paymentMethod: activeSimulation.method,
        reason: "We could not cancel this payment session automatically. Please retry your order.",
      });
    } finally {
      setIsSubmitting(false);
      setActiveSimulation(null);
    }
  }

  // Handle order submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!user) {
      setError("Please create or log in to your verified customer account before checkout.");
      setIsSubmitting(false);
      return;
    }

    if (shipEmailInvalid) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!shipName || !shipEmail || !shipPhone || !shipAddressLine1 || !shipCity || !shipState || !shipPincode) {
      setError("Please fill out all required shipping fields.");
      setIsSubmitting(false);
      return;
    }

    // Phone validation: 10-digit Indian mobile
    if (!isValidIndianPhone(shipPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number (starting with 6-9).");
      setIsSubmitting(false);
      return;
    }

    // Pincode validation: 6-digit Indian PIN
    if (!/^[1-9][0-9]{5}$/.test(normalizeIndianPincode(shipPincode))) {
      setError("Please enter a valid 6-digit PIN code.");
      setIsSubmitting(false);
      return;
    }

    if (shipAltPhone && !isValidIndianPhone(shipAltPhone)) {
      setError("Please enter a valid alternate 10-digit Indian mobile number.");
      setIsSubmitting(false);
      return;
    }

    const token = getStoredCustomerToken() || undefined;
    const shippingAddress = composeShippingAddress();

    const orderData = {
      ship_name: shipName,
      ship_email: normalizeEmailInput(shipEmail),
      ship_phone: normalizeIndianPhone(shipPhone),
      ship_alt_phone: normalizeIndianPhone(shipAltPhone) || undefined,
      ship_address: shippingAddress,
      save_address: saveAddressForFuture,
      address_type: saveAddressType,
      address_label: saveAddressLabel.trim() || undefined,
      address_line1: shipAddressLine1.trim(),
      address_line2: shipAddressLine2.trim() || undefined,
      address_landmark: shipLandmark.trim() || undefined,
      address_is_default: saveAddressAsDefault,
      ship_city: shipCity,
      ship_state: shipState,
      ship_pincode: normalizeIndianPincode(shipPincode),
      payment_method: paymentMethod,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      notes: notes || undefined,
      items: items.map(item => ({
        product_id: item.id,
        variant_id: item.variantId ?? null,
        quantity: item.quantity
      }))
    };

    const res = await placeOrder(orderData, token);

    if (res.success && res.data) {
      if (res.data.customer_auth?.token) {
        storeCustomerToken(res.data.customer_auth.token);
      }

      if (paymentMethod === "cod") {
        checkoutCompletingRef.current = true;
        clearCart();
        redirectToSuccess(res.data.order_number);
      } else {
        const config = res.data.gateway_config;
        const pendingAccessToken = config?.pending_access_token || undefined;

        // If we have a real public key configured and are not in test mode, try loading the real Razorpay SDK
        if (
          paymentMethod === "razorpay" &&
          config?.public_key &&
          config?.provider_order_id &&
          !config.is_test_mode
        ) {
          const loaded = await loadRazorpayScript();
          if (loaded) {
            try {
              const options = {
                key: config.public_key,
                amount: Math.round(res.data.total_amount * 100),
                currency: "INR",
                name: "Little Divinity",
                description: `Order #${res.data.order_number}`,
                order_id: config.provider_order_id,
                handler: async function (response: any) {
                  setIsSubmitting(true);
                  const verifyRes = await verifyPayment({
                    order_number: res.data!.order_number,
                    payment_method: "razorpay",
                    access_token: pendingAccessToken,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }, token);

                  if (verifyRes.success) {
                    checkoutCompletingRef.current = true;
                    clearCart();
                    redirectToSuccess(res.data!.order_number);
                  } else {
                    redirectToFailure({
                      orderNumber: res.data!.order_number,
                      paymentMethod: "razorpay",
                      reason: verifyRes.message || "Payment verification failed.",
                    });
                    setIsSubmitting(false);
                  }
                },
                modal: {
                  ondismiss: async function () {
                    setIsSubmitting(true);
                    const cancelRes = await cancelOrder(
                      res.data!.order_number,
                      token,
                      pendingAccessToken
                    );
                    redirectToFailure({
                      orderNumber: res.data!.order_number,
                      paymentMethod: "razorpay",
                      reason: cancelRes.success
                        ? "Payment was cancelled before completion. You can retry from checkout."
                        : cancelRes.message || "We could not complete your payment. Please retry.",
                    });
                    setIsSubmitting(false);
                  }
                },
                prefill: {
                  name: shipName,
                  email: shipEmail,
                  contact: shipPhone,
                },
                theme: {
                  color: "#0f0f0f",
                }
              };
              const rzp = new (window as any).Razorpay(options);
              rzp.open();
              return;
            } catch (err) {
              console.error("Razorpay SDK initialization failed:", err);
              await cancelOrder(res.data.order_number, token, pendingAccessToken);
              redirectToFailure({
                orderNumber: res.data.order_number,
                paymentMethod: "razorpay",
                reason: "Razorpay could not start properly. Please retry your payment.",
              });
              setIsSubmitting(false);
              return;
            }
          }

          await cancelOrder(res.data.order_number, token, pendingAccessToken);
          redirectToFailure({
            orderNumber: res.data.order_number,
            paymentMethod: "razorpay",
            reason: "Razorpay checkout could not load right now. Please retry in a moment.",
          });
          setIsSubmitting(false);
          return;
        }

        if (
          paymentMethod === "phonepe" &&
          config?.checkout_url &&
          !config.is_test_mode
        ) {
          window.location.href = config.checkout_url;
          return;
        }
        
        if (config?.is_test_mode) {
          setIsSubmitting(false);
          setActiveSimulation({
            orderNumber: res.data.order_number,
            amount: res.data.total_amount,
            method: paymentMethod,
            accessToken: pendingAccessToken
          });
          return;
        }

        await cancelOrder(res.data.order_number, token, pendingAccessToken);
        setError("This payment method is not available right now. Please choose another option.");
        setIsSubmitting(false);
      }
    } else {
      setError(res.message || "An unexpected error occurred while placing your order.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="content-section" style={{ minHeight: "80vh", background: "linear-gradient(to bottom, #FAF8F5, #FFFFFF)", padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: "1200px" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <p className="eyebrow">Secure Gateway</p>
          <h1 className="page-title" style={{ fontSize: "2.8rem", marginBottom: "0.5rem" }}>Checkout</h1>
          <p className="shop-intro" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {checkoutIntro}
          </p>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!hasAnyPaymentGateway && (
          <div className="auth-error" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <span>No payment method is active right now. Please enable one from the admin payment gateway panel.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-two-column checkout-layout" style={{ display: "grid", gap: "2.5rem" }}>
          
          {/* LEFT COLUMN: SHIPPING & PAYMENT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {!user ? (
              <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.76)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)" }}>
                <h2 className="eyebrow" style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--accent-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>1.</span> Sign In Before Checkout
                </h2>
                <h3 style={{ fontSize: "1.55rem", marginBottom: "0.65rem" }}>Create or log in to your customer account first</h3>
                <p className="auth-muted" style={{ marginBottom: "1.25rem" }}>
                  First create your account on the proper registration page, verify your email OTP, and then come back here for shipping and payment. This keeps your orders, saved addresses, and future login all linked correctly.
                </p>
                <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                  <Link href={`/account/register?redirect=${encodeURIComponent("/checkout")}`} className="primary-button">
                    Create Account
                  </Link>
                  <Link href={`/account/login?redirect=${encodeURIComponent("/checkout")}`} className="secondary-button">
                    Login
                  </Link>
                </div>
              </div>
            ) : null}
            
            {/* Shipping Card */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)", opacity: user ? 1 : 0.62 }}>
              <h2 className="eyebrow" style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--accent-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{user ? "1." : "2."}</span> Shipping Details
              </h2>

              {user && savedAddresses.length > 0 ? (
                <div className="checkout-address-picker">
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.35rem" }}>Use a saved address</strong>
                    <p className="auth-muted" style={{ margin: 0 }}>Select home, office, or other saved address and we will auto-fill the form. You can still edit for this order.</p>
                  </div>
                  <div className="checkout-address-grid">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        className="checkout-address-option"
                        data-active={selectedAddressId === address.id ? "true" : "false"}
                        onClick={() => applySavedAddress(address)}
                      >
                        <span className="checkout-address-type">
                          {(address.label || address.type)}{address.is_default ? " · Default" : ""}
                        </span>
                        <strong>{address.recipient_name}</strong>
                        <span>{address.address_line1}</span>
                        {address.address_line2 ? <span>{address.address_line2}</span> : null}
                        <span>{address.city}, {address.state} - {address.pincode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <fieldset disabled={!user} style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
              <div className="auth-grid-form auth-grid-form--double" style={{ display: "grid", gap: "1.2rem" }}>
                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="ship-name">Full Name *</label>
                  <input
                    id="ship-name"
                    type="text"
                    required
                    value={shipName}
                    onChange={(e) => setShipName(e.target.value)}
                    placeholder="Enter your first and last name"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="ship-email">Email Address *</label>
                  <input
                    id="ship-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    className={shipEmailInvalid ? "input-invalid" : ""}
                    aria-invalid={shipEmailInvalid}
                    value={shipEmail}
                    onChange={(e) => setShipEmail(normalizeEmailInput(e.target.value))}
                    placeholder="name@example.com"
                  />
                  {shipEmailInvalid ? <p className="auth-field-error">Enter a valid email like `name@example.com`.</p> : null}
                </div>

                <div className="auth-field">
                  <label htmlFor="ship-phone">Phone Number *</label>
                  <input
                    id="ship-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    maxLength={11}
                    pattern="[6-9][0-9]{9}"
                    className={shipPhoneInvalid ? "input-invalid" : ""}
                    aria-invalid={shipPhoneInvalid}
                    value={formatIndianPhone(shipPhone)}
                    onChange={(e) => setShipPhone(normalizeIndianPhone(e.target.value))}
                    placeholder="10-digit mobile number"
                  />
                  {shipPhoneInvalid ? <p className="auth-field-error">Use a valid 10-digit Indian mobile number.</p> : null}
                </div>

                <div className="auth-field">
                  <label htmlFor="ship-alt-phone">Alternate Phone</label>
                  <input
                    id="ship-alt-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={11}
                    value={formatIndianPhone(shipAltPhone)}
                    onChange={(e) => setShipAltPhone(normalizeIndianPhone(e.target.value))}
                    placeholder="Optional backup contact"
                  />
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="ship-address-line1">Address Line 1 *</label>
                  <input
                    id="ship-address-line1"
                    type="text"
                    required
                    value={shipAddressLine1}
                    onChange={(e) => setShipAddressLine1(e.target.value)}
                    placeholder="Flat, House no., Building, Company, Apartment, Area"
                  />
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="ship-address-line2">Address Line 2</label>
                  <input
                    id="ship-address-line2"
                    type="text"
                    value={shipAddressLine2}
                    onChange={(e) => setShipAddressLine2(e.target.value)}
                    placeholder="Street, locality, nearby area"
                  />
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="ship-landmark">Landmark</label>
                  <input
                    id="ship-landmark"
                    type="text"
                    value={shipLandmark}
                    onChange={(e) => setShipLandmark(e.target.value)}
                    placeholder="Optional landmark for easy delivery"
                  />
                </div>

                <div className="auth-field">
                  <span>State *</span>
                  <select
                    required
                    value={shipState}
                    onChange={(e) => handleStateChange(e.target.value)}
                  >
                    <option value="" disabled hidden>Select State</option>
                    {Object.keys(INDIAN_STATES_AND_CITIES).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-field">
                  <span>City *</span>
                  <select
                    required
                    disabled={!shipState}
                    value={customCityActive ? "Other" : shipCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      {shipState ? "Select City" : "Select State first"}
                    </option>
                    {shipState &&
                      INDIAN_STATES_AND_CITIES[shipState]?.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                  </select>
                </div>

                {customCityActive && (
                  <div className="auth-field" style={{ gridColumn: "1 / -1", animation: "fadeIn 0.2s ease" }}>
                    <span>Specify Custom City *</span>
                    <input
                      type="text"
                      required
                      value={customCityValue}
                      onChange={(e) => handleCustomCityChange(e.target.value)}
                      placeholder="Type your city/town name"
                    />
                  </div>
                )}

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="ship-pincode">Pincode *</label>
                  <input
                    id="ship-pincode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    value={shipPincode}
                    onChange={(e) => setShipPincode(normalizeIndianPincode(e.target.value))}
                    placeholder="6-digit PIN code"
                  />
                  {pincodeStatus ? <p className={pincodeStatus.toLowerCase().includes("unable") ? "auth-field-error" : "auth-field-success"}>{pincodeStatus}</p> : null}
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "0.55rem", flexWrap: "wrap" }}>
                    <span>Save this address for future orders</span>
                    <label className="checkbox-row compact" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={saveAddressForFuture}
                        onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      />
                      <span>Save</span>
                    </label>
                  </div>

                  {saveAddressForFuture ? (
                    <div className="auth-grid-form auth-grid-form--double" style={{ display: "grid", gap: "1rem", padding: "1rem", border: "1px solid var(--line)", borderRadius: "18px", background: "rgba(255,255,255,0.55)" }}>
                      <div className="auth-field">
                        <label htmlFor="save-address-type">Address Type</label>
                        <select id="save-address-type" value={saveAddressType} onChange={(e) => setSaveAddressType(e.target.value as "home" | "office" | "other")}>
                          <option value="home">Home</option>
                          <option value="office">Office</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="auth-field">
                        <label htmlFor="save-address-label">Address Label</label>
                        <input
                          id="save-address-label"
                          type="text"
                          value={saveAddressLabel}
                          onChange={(e) => setSaveAddressLabel(e.target.value)}
                          placeholder="e.g. Home, Office HQ, Mom's Place"
                        />
                      </div>
                      <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                        <label className="checkbox-row compact" style={{ margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={saveAddressAsDefault}
                            onChange={(e) => setSaveAddressAsDefault(e.target.checked)}
                          />
                          <span>Make this my default address</span>
                        </label>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="auth-field" style={{ gridColumn: "1 / -1" }}>
                  <span>Order Notes (Optional)</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions for delivery (e.g. deliver after 5 PM)"
                    style={{
                      padding: "1rem",
                      border: "1px solid var(--line-strong)",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.86)",
                      color: "var(--text)",
                      fontFamily: "inherit",
                      fontSize: "1rem",
                      resize: "none"
                    }}
                  />
                </div>
                </div>
              </fieldset>
            </div>

            {/* Payment Method Card */}
            <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)", opacity: user ? 1 : 0.62 }}>
              <h2 className="eyebrow" style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--accent-deep)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{user ? "2." : "3."}</span> Payment Method
              </h2>

              <fieldset disabled={!user} style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
              <div style={{ display: "grid", gap: "1rem" }}>
                {!hasAnyPaymentGateway ? (
                  <div style={{ padding: "1rem 1.1rem", borderRadius: "18px", border: "1px solid rgba(224, 90, 71, 0.25)", background: "rgba(224, 90, 71, 0.06)", color: "#8a3b30", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    No payment gateway is currently active in admin settings. Please enable at least one payment option to accept orders.
                  </div>
                ) : null}
                
                {/* Cash on Delivery */}
                {hasGateway("cod") && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.2rem",
                    border: paymentMethod === "cod" ? "2px solid var(--accent)" : "1px solid var(--line)",
                    borderRadius: "20px",
                    background: paymentMethod === "cod" ? "rgba(241, 167, 32, 0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={{ marginTop: "3px", accentColor: "var(--accent)" }}
                  />
                  <div>
                    <strong style={{ display: "block", color: "var(--text)", fontSize: "1.05rem" }}>
                      {gatewayMeta("cod")?.display_name || "Cash On Delivery (COD)"}
                    </strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Pay with cash upon delivery. Recommended & fully functional gateway.</span>
                  </div>
                </label>
                )}

                {/* Razorpay */}
                {hasGateway("razorpay") && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.2rem",
                    border: paymentMethod === "razorpay" ? "2px solid var(--accent)" : "1px solid var(--line)",
                    borderRadius: "20px",
                    background: paymentMethod === "razorpay" ? "rgba(241, 167, 32, 0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    style={{ marginTop: "3px", accentColor: "var(--accent)" }}
                  />
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "var(--text)", fontSize: "1.05rem" }}>
                        {gatewayMeta("razorpay")?.display_name || "Razorpay (Cards / UPI / NetBanking)"}
                      </strong>
                      <span style={{ fontSize: "0.75rem", background: "rgba(var(--rgb-text), 0.08)", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                        {gatewayMeta("razorpay")?.is_test_mode ? "Test Mode" : "Secure"}
                      </span>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Pay securely via Credit Card, Debit Card, NetBanking, UPI, or wallets. Test mode will use a safe simulation automatically.</span>
                  </div>
                </label>
                )}

                {/* PhonePe */}
                {hasGateway("phonepe") && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.2rem",
                    border: paymentMethod === "phonepe" ? "2px solid var(--accent)" : "1px solid var(--line)",
                    borderRadius: "20px",
                    background: paymentMethod === "phonepe" ? "rgba(241, 167, 32, 0.05)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="phonepe"
                    checked={paymentMethod === "phonepe"}
                    onChange={() => setPaymentMethod("phonepe")}
                    style={{ marginTop: "3px", accentColor: "var(--accent)" }}
                  />
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ color: "var(--text)", fontSize: "1.05rem" }}>
                        {gatewayMeta("phonepe")?.display_name || "PhonePe UPI Gateway"}
                      </strong>
                      <span style={{ fontSize: "0.75rem", background: "rgba(var(--rgb-text), 0.08)", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                        {gatewayMeta("phonepe")?.is_test_mode ? "Test Mode" : "UPI"}
                      </span>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Pay through PhonePe checkout. In test mode the order uses a safe prepaid simulation.</span>
                  </div>
                </label>
                )}
              </div>
              </fieldset>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & OFFERS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Order Review Card */}
            <div className="cart-summary-card" style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "2rem", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow)" }}>
              <p className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "0.5rem" }}>Review Order</p>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "1.5rem" }}>Items Summary</h2>

              {/* Items List */}
              <div style={{ display: "grid", gap: "1rem", maxHeight: "250px", overflowY: "auto", paddingRight: "5px", marginBottom: "1.5rem" }}>
                {items.map((item) => (
                  <div key={item.slug} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "0.8rem" }}>
                    <div style={{ width: "50px", height: "50px", position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--line)" }}>
                      <img
                        src={resolveAssetUrl(item.image)}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>{item.name}</h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                        {item.quantity} x {formatPrice(item.price, currencySymbol)}
                      </p>
                    </div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text)" }}>
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Coupon Box */}
              <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--line)", paddingBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-deep)", display: "block", marginBottom: "0.5rem" }}>Apply Promo Code</span>
                
                {appliedCoupon ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(45, 123, 76, 0.08)", border: "1px dashed #226643", borderRadius: "14px", padding: "0.6rem 1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ color: "#226643", fontSize: "0.9rem" }}>Code: {appliedCoupon.code} Applied</strong>
                      <span style={{ color: "var(--text)", fontSize: "0.8rem" }}>Saved {appliedCoupon.type === "percent" ? `${appliedCoupon.value}%` : formatPrice(appliedCoupon.value, currencySymbol)}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} style={{ border: "none", background: "transparent", color: "#a43c31", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, textDecoration: "underline" }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code (e.g. FESTIVE20)"
                      style={{
                        flex: 1,
                        padding: "0.6rem 1rem",
                        border: "1px solid var(--line-strong)",
                        borderRadius: "14px",
                        background: "rgba(255, 255, 255, 0.86)",
                        fontSize: "0.9rem"
                      }}
                    />
                    <button type="button" onClick={() => handleApplyCoupon()} className="secondary-button" style={{ padding: "0.6rem 1.2rem", borderRadius: "14px", border: "1px solid var(--accent)", color: "var(--accent-deep)", background: "transparent", fontWeight: 600, cursor: "pointer" }}>
                      Apply
                    </button>
                  </div>
                )}
                
                {couponError && <p style={{ color: "#a43c31", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>{couponError}</p>}
                {couponSuccess && <p style={{ color: "#226643", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>{couponSuccess}</p>}
              </div>

              {/* Price Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--muted)" }}>Subtotal</span>
                  <strong>{formatPrice(subtotal, currencySymbol)}</strong>
                </div>

                {appliedCoupon && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#226643" }}>
                    <span>Coupon Discount</span>
                    <strong>-{formatPrice(discountAmount, currencySymbol)}</strong>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--muted)" }}>Shipping Fee</span>
                  {shippingCost === 0 ? (
                    <strong style={{ color: "#226643" }}>FREE</strong>
                  ) : (
                    <strong>{formatPrice(shippingCost, currencySymbol)}</strong>
                  )}
                </div>

                {mixedShippingRules && (
                  <p style={{ margin: "0", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.3 }}>
                    Custom delivery charges stay applied on selected products. The free-shipping threshold only removes the standard delivery part.
                  </p>
                )}

                {onlyCustomShipping && (
                  <p style={{ margin: "0", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.3 }}>
                    This cart uses product-level delivery charges, so the store-wide free-shipping threshold does not apply here.
                  </p>
                )}

                {showDefaultShippingUpsell && (
                  <p style={{ margin: "0", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.3 }}>
                    Add pieces worth {formatPrice(freeShippingThreshold - netSubtotal, currencySymbol)} more for free delivery!
                  </p>
                )}
              </div>

              {/* Total Row */}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: "1.2rem", marginBottom: "2rem" }}>
                <strong style={{ fontSize: "1.2rem", color: "var(--text)" }}>Total Amount</strong>
                <strong style={{ fontSize: "1.4rem", color: "var(--accent-deep)" }}>
                  {formatPrice(grandTotal, currencySymbol)}
                </strong>
              </div>

              {/* SSL Trust Strip */}
              <div className="checkout-trust-strip">
                <span>🔒 SSL Secured</span>
                <span>✓ Razorpay Certified</span>
                <span>{hasGateway("cod") ? "✓ COD Available" : "✓ Prepaid Only"}</span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !hasAnyPaymentGateway || !user}
                className="primary-button"
                style={{
                  width: "100%",
                  textAlign: "center",
                  justifyContent: "center",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: isSubmitting || !hasAnyPaymentGateway || !user ? "not-allowed" : "pointer",
                  opacity: isSubmitting || !hasAnyPaymentGateway || !user ? 0.75 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid #FFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Placing Your Order…
                  </>
                ) : !user ? (
                  <>Create or login to continue checkout</>
                ) : !hasAnyPaymentGateway ? (
                  <>No active payment method available</>
                ) : (
                  <>Confirm &amp; Place Order Securely — {currencySymbol}{grandTotal.toLocaleString("en-IN")}</>
                )}
              </button>
              
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Link href="/cart" className="text-link" style={{ fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>←</span> Back to Cart / Edit Items
                </Link>
              </div>
            </div>

            {/* Public Coupons Card */}
            {coupons.length > 0 && (
              <div style={{ border: "1px solid var(--line)", borderRadius: "28px", padding: "1.5rem", background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(10px)" }}>
                <p className="eyebrow" style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>Available Offers</p>
                <div style={{ display: "grid", gap: "0.8rem" }}>
                  {coupons.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCouponCode(c.code);
                        setCouponError(null);
                        setCouponSuccess(null);
                      }}
                      style={{
                        padding: "0.8rem",
                        border: "1px dashed var(--line-strong)",
                        borderRadius: "16px",
                        cursor: "pointer",
                        background: couponCode.toLowerCase() === c.code.toLowerCase() ? "rgba(241, 167, 32, 0.04)" : "transparent",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, padding: "2px 8px", background: "var(--accent)", color: "var(--accent-deep)", borderRadius: "6px" }}>
                          {c.code}
                        </span>
                        <strong style={{ fontSize: "0.85rem" }}>
                          {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.3 }}>{c.description || "Apply to save on this order."}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </form>
      </div>

      {/* Online Gateway Simulation Overlay */}
      {activeSimulation && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(15, 15, 15, 0.4)",
          backdropFilter: "blur(20px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: "32px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            padding: "2.5rem",
            maxWidth: "500px",
            width: "100%",
            textAlign: "center",
            backdropFilter: "blur(25px)",
            position: "relative"
          }}>
            <p className="eyebrow" style={{ color: "var(--accent-deep)", marginBottom: "0.5rem" }}>
              Secure Payment Gateway Sandbox
            </p>
            <h3 style={{ fontSize: "1.8rem", color: "var(--text)", fontWeight: 700, marginBottom: "1rem" }}>
              Simulate Gateway Integration
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              You are simulating a payment of <strong style={{ color: "var(--text)" }}>{formatPrice(activeSimulation.amount, currencySymbol)}</strong> for Order <strong style={{ color: "var(--text)" }}>#{activeSimulation.orderNumber}</strong> using <strong style={{ textTransform: "capitalize", color: "var(--text)" }}>{activeSimulation.method}</strong>.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <button
                type="button"
                onClick={handleConfirmSimulation}
                className="primary-button"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: "#226643",
                  borderColor: "#226643",
                  color: "#fff"
                }}
              >
                Approve & Verify Successful Payment
              </button>

              <button
                type="button"
                onClick={handleCancelSimulation}
                className="secondary-button"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  borderColor: "#a43c31",
                  color: "#a43c31",
                  background: "transparent"
                }}
              >
                Simulate Abort / Cancel Payment
              </button>
            </div>
            
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "1.5rem" }}>
              This sandbox overlay acts as a secure fallback interface during development and verification stages. In production, this falls back to direct API checkouts.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="content-section auth-page" style={{ justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Little Divinity</p>
            <h2 className="auth-title">Preparing your secure checkout…</h2>
            <p className="auth-muted">Loading payment methods, saved addresses, and delivery details.</p>
          </div>
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
