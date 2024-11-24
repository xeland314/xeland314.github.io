import ContactForm from "./form";

export default function ContactSection() {
  return (
    <section id="contact"
    className="flex flex-col w-full items-center">
      <div className="mb-4">
        <ContactForm />
      </div>
    </section>
  );
}
