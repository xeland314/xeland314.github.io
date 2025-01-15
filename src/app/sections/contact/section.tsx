import ContactForm from "./form";

export default function ContactSection() {
  return (
    <section id="contact" className="flex flex-col w-full items-center">
      <h3 className="w-full text-2xl font-bold mb-4 text-center border-b-2 border-b-gray-700 dark:border-b-slate-100 pb-4 mx-4">
        Contáctame
      </h3>
      <div className="mb-4">
        <ContactForm />
      </div>
    </section>
  );
}
