"use client";

import { useState, useEffect, useCallback } from "react";

type EmailType = {
  email: string;
  message: string;
  name: string;
  "g-recaptcha-response": string | null;
};
type EmailWithoutCaptcha = Omit<EmailType, "g-recaptcha-response">;
type EmailErrors = Partial<EmailWithoutCaptcha>;
type EmailContent = Partial<EmailType>;

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const useEmailForm = () => {
  const [content, setContent] = useState<EmailContent>({});
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<EmailErrors>({});
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("emailDate");
    const savedCount = localStorage.getItem("emailCount");

    if (savedDate === today && savedCount) {
      setEmailCount(parseInt(savedCount, 10));
    } else {
      localStorage.setItem("emailDate", today);
      localStorage.setItem("emailCount", "0");
    }
  }, []);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setContent((prevContent) => ({
      ...prevContent,
      "g-recaptcha-response": token,
    }));
  }, []);

  const handleRecaptchaExpired = useCallback(() => {
    setContent((prevContent) => ({
      ...prevContent,
      "g-recaptcha-response": null,
    }));
  }, []);

  const setField = useCallback((field: keyof EmailContent, value: string) => {
    setContent((prevContent) => ({
      ...prevContent,
      [field]: value,
    }));
  }, []);

  const validateForm = () => {
    const newErrors: EmailErrors = {};
    if (content.email && !validateEmail(content.email)) {
      newErrors.email = "Por favor, ingresa un correo electrónico válido.";
    }
    if (content.message && content.message.trim() === "") {
      newErrors.message = "El mensaje no puede estar vacío.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content["g-recaptcha-response"]) {
      setStatus("Por favor, completa el reCAPTCHA.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (emailCount >= 2) {
      setStatus("Has alcanzado el límite de correos enviados por hoy.");
      return;
    }

    const res = await fetch("https://formspree.io/f/mzzbvwpw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: content.email,
        content: content.message,
        name: content.name,
        "g-recaptcha-response": content["g-recaptcha-response"],
      }),
    });

    if (res.status === 200) {
      setStatus("Mensaje enviado correctamente!");
      setContent({
        email: "",
        message: "",
        name: "",
        "g-recaptcha-response": "",
      });
      setEmailCount((prevCount) => {
        const newCount = prevCount + 1;
        localStorage.setItem("emailCount", newCount.toString());
        return newCount;
      });
    } else {
      setStatus("Error al enviar el mensaje. Inténtalo de nuevo.");
    }
  };

  return {
    content,
    setField,
    status,
    handleRecaptchaChange,
    handleRecaptchaExpired,
    errors,
    emailCount,
    sendEmail,
  };
};

export default useEmailForm;
