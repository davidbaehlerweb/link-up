import React, { useEffect } from 'react';
import * as THREE from 'three';

const ThreeDIcon = () => {
    useEffect(() => {
        // Créer la scène
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth / 2, window.innerHeight / 2); // Ajuste la taille ici
        document.body.appendChild(renderer.domElement);

        // Créer une géométrie et un matériau
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Positionner la caméra
        camera.position.z = 5;

        // Fonction d'animation
        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();

        // Nettoyage à la désmontée du composant
        return () => {
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    return null;
};

export default ThreeDIcon;
