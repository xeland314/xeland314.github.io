import ContactForm from "./form";

export default function ContactSection() {
  return (
    <section id="contact" className="flex flex-col w-full items-center">
      <h3 className="w-full text-2xl font-bold mb-4 text-center pb-4 mx-4">
        Contáctame
      </h3>
      <hr className="w-full pb-[1px] mb-4 scrolldown-animation-2 bg-gray-800 dark:bg-white" />
      <div className="mb-4">
        <ContactForm />
      </div>
    </section>
  );
}
