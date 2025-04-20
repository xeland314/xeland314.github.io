import ContactForm from "./form";

export default function ContactSection() {
  return (
    <section id="contact" className="w-full flex flex-col items-center justify-center">
      <h3 className="w-full text-2xl font-bold text-center pb-4 mx-4 scrolldown-animation-2">
        Contáctame
      </h3>
      <hr className="w-full pb-[1px] mb-4 scrolldown-animation-2 bg-gray-800 dark:bg-white" />
      <div className="w-full flex mb-4 items-center justify-center">
        <ContactForm />
      </div>
    </section>
  );
}
