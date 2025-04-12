"use client";

export default function BuyMeACookie() {
  return (
    <a href="https://www.buymeacoffee.com/xeland314" target="_blank">
      <img
        src="https://img.buymeacoffee.com/button-api/?text=Buy me a cookie&emoji=🐱&slug=xeland314&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
        alt="Buy me a cookie at https://www.buymeacoffee.com/xeland314"
      />
    </a>
  );
}

export function BuyMeACoffee() {
  return (
    <a href="https://ko-fi.com/C0C41DCI4T" target="_blank">
      <img
        className="border-0 h-12 aspect-auto"
        src="https://storage.ko-fi.com/cdn/kofi2.png?v=6"
        alt="Buy Me a Coffee at ko-fi.com/C0C41DCI4T"
      />
    </a>
  );
}

export function PaymentButtons() {
  return (
    <div className="flex flex-col md:flex-row gap-5 justify-center items-center pb-8 md:pb-0">
      <BuyMeACookie />
      <BuyMeACoffee />
    </div>
  );
}
