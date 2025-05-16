"""
Ventana principal simplificada para pruebas.
"""

import tkinter as tk
from tkinter import ttk

class MainWindow:
    """
    Versión simplificada de la ventana principal.
    """
    
    def __init__(self, root):
        """
        Inicializar la ventana principal.
        
        Args:
            root: Objeto raíz de Tkinter
        """
        self.root = root
        self.root.title("Sistema de Optimización de Rutas - Prueba")
        self.root.geometry("800x600")
        
        # Crear un Label simple
        label = ttk.Label(root, text="Ventana de prueba - Si ves esto, funciona correctamente")
        label.pack(pady=20)
        
        # Crear un botón de salida
        exit_button = ttk.Button(root, text="Salir", command=root.quit)
        exit_button.pack(pady=10)