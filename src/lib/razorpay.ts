export function loadRazorpay() : Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(false);
    if (document.getElementById('razorpay-js')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(false);
    document.body.appendChild(script);
  });
}
