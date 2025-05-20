// NewsletterForm.jsx
"use client";

import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { storage, auth } from "../firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import styles from "../styles/NewsletterForm.module.css";

export default function NewsletterForm({ onSend }) {
    // form state
    const [formData, setFormData] = useState({
        subject: "",
        headline: "",
        body: "",
        imageUrl: "",
        buttonText: "",
        buttonLink: "",
    });

    // image file & preview
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // authenticate user anonymously on mount
    useEffect(() => {
        signInAnonymously(auth)
            .then((userCredential) => {
                console.debug("Signed in anonymously:", userCredential.user.uid);
            })
            .catch((error) => {
                console.error("Anonymous sign-in failed:", error);
                alert("Firebase auth error: " + error.message);
            });
    }, []);

    // handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // handle file selection and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // single-responsibility: upload image and return its URL
    const uploadImageAndGetUrl = async () => {
        if (!imageFile) return formData.imageUrl;
        // generate a unique path
        const imageRef = ref(storage, `newsletter-images/${uuidv4()}`);
        // upload bytes
        await uploadBytes(imageRef, imageFile);
        // get public URL
        return await getDownloadURL(imageRef);
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1) upload image if any
            const uploadedImageUrl = await uploadImageAndGetUrl();

            // 2) send data upstream
            await onSend({
                ...formData,
                imageUrl: uploadedImageUrl,
            });

            // 3) reset form
            setFormData({
                subject: "",
                headline: "",
                body: "",
                imageUrl: "",
                buttonText: "",
                buttonLink: "",
            });
            setImageFile(null);
            setPreviewUrl("");
        } catch (error) {
            // debug and user feedback
            console.error("Error sending newsletter:", error);
            alert("Error sending newsletter: " + error.message);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    name="subject"
                    placeholder="Email Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <input
                    name="headline"
                    placeholder="Headline"
                    value={formData.headline}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <textarea
                    name="body"
                    placeholder="Body Text"
                    value={formData.body}
                    onChange={handleChange}
                    className={styles.textarea}
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                />
                <input
                    name="buttonText"
                    placeholder="Button Text"
                    value={formData.buttonText}
                    onChange={handleChange}
                    className={styles.input}
                />
                <input
                    name="buttonLink"
                    placeholder="Button Link"
                    value={formData.buttonLink}
                    onChange={handleChange}
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>
                    Send Newsletter
                </button>
            </form>

            <hr className="my-6" />

            <div className={styles.preview}>
                <h2 className="text-2xl font-bold mb-2">
                    {formData.headline || "Your Headline Here"}
                </h2>
                <p className="mb-4">
                    {formData.body || "This is your newsletter body text."}
                </p>
                {(previewUrl || formData.imageUrl) && (
                    <img
                        src={previewUrl || formData.imageUrl}
                        alt="Preview"
                        className={styles.previewImage}
                    />
                )}
                {formData.buttonText && formData.buttonLink && (
                    <a
                        href={formData.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewButton}
                    >
                        {formData.buttonText}
                    </a>
                )}
            </div>
        </div>
    );
}
