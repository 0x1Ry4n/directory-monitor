import os
import datetime
import tkinter as tk
from tkinter import ttk, filedialog
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from win10toast import ToastNotifier

class EventHandler(FileSystemEventHandler):
    def __init__(self, app):
        self.app = app

    def on_created(self, event):
        # Verificar se o evento é para um arquivo ou diretório criado
        if event.is_directory or not event.is_directory:
            self.app.list_files()
            self.send_notification(event.src_path, "criado", 3)            
    
    def on_moved(self, event):
        # Verificar se o evento é para um arquivo ou diretório movido
        if event.is_directory:
            self.app.list_files()
            self.send_notification(event.src_path, "movido ou removido", 3)
        elif event.src_path in self.app.files:
            # Atualizar nome do arquivo na lista de arquivos se ele foi renomeado
            self.app.files.remove(event.src_path)
            self.app.files.append(event.dest_path)
            self.app.list_files()
            self.send_notification(event.src_path, "movido ou removido", 3)
            

    def on_deleted(self, event): 
        # Verificar se o evento é para um arquivo ou diretório removido
        if event.is_directory or not event.is_directory: 
            self.app.files.remove(event.src_path)
            self.app.list_files()
            self.send_notification(event.src_path, "removido", 3)

    def on_modified(self, event):
        # Verificar se o evento é para um arquivo modificado
        if not event.is_directory: 
            self.app.list_files()
            self.send_notification(event.src_path, "modificado", 3)

    def send_notification(self, event, message, timeout): 
        # Enviar notificação 
        toaster = ToastNotifier()
        toaster.show_toast("Monitor de diretórios", f"{event} foi {message}", duration=timeout)

  
class App:  
    def __init__(self, master):
        self.master = master
        master.title("Monitor de diretórios")

        # Criar widgets

        self.label = ttk.Label(master, text="Selecione a pasta a ser monitorada:", font="Helvetica 10 bold")
        self.label.pack(pady=10)
       
        self.button = ttk.Button(master, text="Selecionar pasta", command=self.select_folder)
        self.button.pack(pady=5)

        self.path_label = ttk.Label(master, text="Caminho selecionado: ")
        self.path_label.pack(pady=5)

        self.table = ttk.Treeview(master)
        self.table["columns"] = ("name", "type", "extension", "last_modified")
        self.table.column("name", width=200, minwidth=150)
        self.table.column("type", width=100, minwidth=75)
        self.table.column("extension", width=100, minwidth=75)
        self.table.column("last_modified", width=150, minwidth=100)
        
        self.table.heading("name", text="Nome", anchor="w")
        self.table.heading("type", text="Tipo", anchor="w")
        self.table.heading("extension", text="Extensão", anchor="w")
        self.table.heading("last_modified", text="Data de modificação", anchor="w")
        self.table.pack(pady=10)
        
        self.files = []
    
    def update_path_label(self, path): 
        self.path_label.config(text=f"Caminho selecionado: {path}")

    def select_folder(self):
        # Exibir diálogo de seleção de pasta
        folder_path = filedialog.askdirectory()

        if folder_path:
            self.path = folder_path
            self.update_path_label(folder_path)

            # Limpar lista de arquivos e diretórios
            self.files = []
            
            # Iniciar monitoramento
            self.start_monitoring()
    
    def list_files(self):
        # Limpar tabela
        for row in self.table.get_children():
            self.table.delete(row)
        
        # Adicionar arquivos e diretórios à tabela
        for filename in os.listdir(self.path):
            full_path = os.path.join(self.path, filename)
            self.files.append(full_path)
            if os.path.isdir(full_path):
                self.table.insert("", "end", values=(filename, "Diretório"))
            else:
                # Mostrar a extensão e data de modificação de arquivos
                extension = os.path.splitext(filename)[1]
                mod_time = datetime.datetime.fromtimestamp(os.path.getmtime(full_path)).strftime('%Y-%m-%d %H:%M:%S')
                self.table.insert("", "end", values=(filename, "Arquivo", extension, mod_time))

    def start_monitoring(self):
        # Verificar se a pasta é válida
        if not os.path.isdir(self.path):
            tk.messagebox.showerror("Erro", "Caminho inválido.")
            return
        
        # Iniciar observer
        event_handler = EventHandler(self)
        observer = Observer()
        observer.schedule(event_handler, path=self.path, recursive=True)
        observer.start()
        
        # Listar arquivos e diretórios existentes
        self.list_files()

# Criar janela
root = tk.Tk()
app = App(root)
root.mainloop()
