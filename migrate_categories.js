
import { db } from './js/firebase-config.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function migrate() {
    const existingCats = ["Proteínas", "Creatinas", "Pre-entreno", "Aminoácidos"];
    const categoriesCol = collection(db, "categories");

    console.log("Iniciando migración de categorías...");

    for (const cat of existingCats) {
        const q = query(categoriesCol, where("name", "==", cat));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            await addDoc(categoriesCol, { name: cat });
            console.log(`✅ Categoría añadida: ${cat}`);
        } else {
            console.log(`ℹ️ La categoría "${cat}" ya existe, saltando...`);
        }
    }

    console.log("Migración completada. Ya puedes borrar este archivo.");
}

migrate();
