import os
import datetime
import tkinter as tk
import configparser
from tkinter import ttk, filedialog
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from win10toast import ToastNotifier
from controllers.send_webhook import send_request
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

class ConfigManager:
    def __init__(self, config_file):
        self.config_file = config_file
        self.config = configparser.ConfigParser()

        if not os.path.isfile(config_file):
            self.create_config()
            self.set_last_watched_folder("")

    def create_config(self): 
        self.config.add_section('Settings')
        self.config.set('Settings', 'last_watched_folder', '')

        with open(self.config_file, 'w') as configfile:
            self.config.write(configfile)

    def get_last_watched_folder(self):
        try:
            self.config.read(self.config_file)
            return self.config.get('Settings', 'last_watched_folder')
        except (configparser.NoSectionError, configparser.NoOptionError) as e:
            print(e)
            return None

    def set_last_watched_folder(self, folder_path):
        self.config.read(self.config_file)
        
        if not self.config.has_section('Settings'):
            self.config.add_section('Settings')

        self.config.set('Settings', 'last_watched_folder', folder_path)
       
        with open(self.config_file, 'w') as configfile:
            self.config.write(configfile)

class NotificationManager: 
    def __init__(self): 
        self.toaster = ToastNotifier()

    def send_webhook_notification(self, url, notificationType, event, objectType, extension, folderId, timeout):
        data = {
            "notificationType": notificationType,
            "event": "" if event is None else event, 
            "objectType": objectType, 
            "extension": "" if extension is None else extension, 
            "folderId": folderId
        }
        
        try:
            response = send_request(url=url, data=data, headers={"Content-type": "application/json"})
            print(response)

            if response is None: 
                self.toaster.show_toast("Directory Monitor", f"Webhook Bad Request")

            self.toaster.show_toast("Directory Monitor", event, duration=timeout)
        except Exception as e: 
            self.toaster.show_toast("Directory Monitor", f"Notification exception: {e}")

class EventHandler(FileSystemEventHandler):
    def __init__(self, app, notification_manager):
        self.app = app
        self.url = os.environ.get("WEBHOOK_URL")
        self.notification_manager = notification_manager

    def send_notification(self, event):
        object_type = "folder" if event.is_directory else "file"
        extension = os.path.splitext(event.src_path)[-1]
        
        payload = {
            "folderId": "b9178d6d-7de5-49e5-9c56-d973f6b9549e",
            "notificationType": event.event_type,
            "event": f"{event.src_path} has {event.event_type}",
            "objectType": object_type,
            "extension": extension,
            "timeout": 3
        }

        self.notification_manager.send_webhook_notification(self.url, **payload)
        self.app.list_files()

    def on_created(self, event): 
        self.send_notification(event)

    def on_deleted(self, event): 
        if event.is_directory or not event.is_directory: 
            self.app.files.remove(event.src_path)
            self.send_notification(event)
            self.app.list_files()

    def on_moved(self, event): 
        if event.is_directory:
            self.send_notification(event)
            self.app.list_files()
        elif event.src_path in self.app.files:
            self.app.files.remove(event.src_path)
            self.app.files.append(event.dest_path)
            self.send_notification(event)
            self.app.list_files()
  
class App:  
    def __init__(self, master):
        self.__master = master
        self.__master.title("Directory Monitor by Ryan")
        
        self.__config_manager = ConfigManager("config.ini")
        self.path = self.__config_manager.get_last_watched_folder()

        self.create_widgets()
        self.files = []
    
    def create_widgets(self): 
        self.label = ttk.Label(self.__master, text="Select the folder to be monitored", font="Helvetica 10 bold")
        self.label.pack(pady=10)
       
        self.button = ttk.Button(self.__master, text="Select Folder", command=self.select_folder)
        self.button.pack(pady=5)

        self.path_label = ttk.Label(self.__master, text="Folder path: ")
        self.path_label.pack(pady=5)

        self.table = ttk.Treeview(self.__master)
        self.table["columns"] = ("name", "type", "extension", "last_modified")
        self.table.column("name", width=200, minwidth=150)
        self.table.column("type", width=100, minwidth=75)
        self.table.column("extension", width=100, minwidth=75)
        self.table.column("last_modified", width=150, minwidth=100)
        
        self.table.heading("name", text="Name", anchor="w")
        self.table.heading("type", text="Type", anchor="w")
        self.table.heading("extension", text="Extension", anchor="w")
        self.table.heading("last_modified", text="Modification date", anchor="w")
        self.table.pack(pady=10)

    def update_path_label(self, path): 
        self.path_label.config(text=f"Selected path: {path}")

    def select_folder(self):
        folder_path = filedialog.askdirectory()

        if folder_path:
            self.path = folder_path
            self.update_path_label(self.path)

            self.__config_manager.set_last_watched_folder(self.path)

            self.files = []
            
            self.start_monitoring()
    
    def list_files(self):
        for row in self.table.get_children():
            self.table.delete(row)
        
        for filename in os.listdir(self.path):
            full_path = os.path.join(self.path, filename)
            self.files.append(full_path)
            if os.path.isdir(full_path):
                self.table.insert("", "end", values=(filename, "Directory"))
            else:
                extension = os.path.splitext(filename)[1]
                mod_time = datetime.datetime.fromtimestamp(os.path.getmtime(full_path)).strftime('%Y-%m-%d %H:%M:%S')
                self.table.insert("", "end", values=(filename, "File", extension, mod_time))

    def start_monitoring(self):
        if not os.path.isdir(self.path):
            tk.messagebox.showerror("Error", "Invalid path.")
            return
        
        print(self.path)
        self.update_path_label(self.path)

        notification_manager = NotificationManager()
        event_handler = EventHandler(self, notification_manager)
        observer = Observer()
        observer.schedule(event_handler, path=self.path, recursive=True)
        observer.start()
        
        self.list_files()

def main(): 
    root = tk.Tk()
    app = App(root)
    app.start_monitoring()
    root.mainloop()


if __name__ == "__main__":
    main()