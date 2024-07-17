import React, { useState, useEffect, useMemo } from "react";
import useAuth from "../hooks/useAuth";
import Alert from "../components/Alert";
import SearchBox from "react-search-box";
import { useDebounce } from "use-debounce";

const FilesURL = import.meta.env.VITE_Files_URL;

const Records = () => {
  const token = localStorage.getItem("tokenAuthUser");
  const headers = { Authorization: `Bearer ${token}` };
  const { auth } = useAuth();
  const { email, userRoles } = auth;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ email: "", fileName: "" });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [debouncedTerm] = useDebounce(debouncedSearchTerm, 300);
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({});
  const [modifiedFolder, setModifiedFolder] = useState(null);
  const [isOpen, setIsOpen] = useState({});
  let isDoctor = false;
  if (auth && userRoles.some((role) => role.roleId === 2)) {
    isDoctor = true;
  }

  useEffect(() => {
    setSearch((prevState) => ({
      ...prevState,
      fileName: debouncedTerm,
    }));
  }, [debouncedTerm]);

  useEffect(() => {
    const getFiles = async () => {
      try {
        const url = `${FilesURL}${email}?role=${encodeURIComponent(
          JSON.stringify(userRoles)
        )}`;
        const resp = await fetch(url, { method: "GET", headers });
        if (!resp.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await resp.json();

        // Group files by folder
        const filesByFolder = {};
        const emailFolderPrefix = `${search.email}/`;

        for (const file of data) {
          // removes extra file but also removes all folders that are empty :(
          // if (file.size === 0 ) {
          //   continue;
          // }

          // Filter folders and files by search criteria and set them in state
          const folder = file.name.substring(emailFolderPrefix).split("/")[0];
          if (!filesByFolder[folder]) {
            filesByFolder[folder] = [];
          }
          filesByFolder[folder].push(file);
        }

        const filteredFolders = Object.entries(filesByFolder)

          // Filter folders and files by search criteria
          .filter(
            ([folder, files]) =>
              folder.toLowerCase().includes(search.fileName) ||
              files.some((file) =>
                file.name.toLowerCase().includes(search.fileName)
              )
          )

          // Map the filtered folders to an array of objects with name and files properties
          .map(([folder, files]) => ({
            name: folder,
            files,
          }));

        setFiles(filteredFolders);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    // Call the function to fetch files on component mount and whenever the email or search criteria changes
    getFiles();
  }, [email, search.email, search.fileName]);

  const downloadFile = (url) => {
    window.open(url);
  };

  const formatFileSize = useMemo(() => {
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    return (sizeInBytes) => {
      if (sizeInBytes < KB) {
        return sizeInBytes + " bytes";
      } else if (sizeInBytes < MB) {
        return (sizeInBytes / KB).toFixed(2) + " KB";
      } else if (sizeInBytes < GB) {
        return (sizeInBytes / MB).toFixed(2) + " MB";
      } else {
        return (sizeInBytes / GB).toFixed(2) + " GB";
      }
    };
  }, []);

  const handleUpload = async (event, folderName) => {
    event.preventDefault();
    const file = event.target.files[0];

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderName", folderName);

      const response = await fetch(`${FilesURL}upload${email}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.status === 200) {
        setAlert({
          msg: result.msg,
          error: true,
        });
        throw new Error("Network response was not ok");
      }

      setAlert({
        msg: result.msg,
        error: false,
      });

      setModifiedFolder(folderName);
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSearchChange = (e) => {
    setDebouncedSearchTerm(e.target.value);
  };

  const toggleAccordion = (folderName) => {
    setIsOpen((prevState) => ({
      ...prevState,
      [folderName]: !prevState[folderName],
    }));
  };

  return (
    <div className="Records">
      <h1>Medical Records</h1>
      {loading ? (
        <section id="chatApp" className="chatApp">
          <div className="chatApp__loaderWrapper">
            <div className="chatApp__loaderText">Loading...</div>
            <div className="chatApp__loader"></div>
          </div>
        </section>
      ) : (
        <div>
          <SearchBox
            placeholder="Search"
            data={files
              .filter((folder) =>
                folder.name.toLowerCase().includes(search.fileName)
              )
              .map((folder) => ({
                key: folder.name,
                value: folder.name,
              }))}
            onChange={(value) =>
              handleSearchChange({ target: { name: "fileName", value } })
            }
            onSelect={(value) =>
              setSearch((prevState) => ({
                ...prevState,
                fileName: value,
              }))
            }
          />

          {files.map((folder) => (
            <div className="accordion" key={folder.name}>
              <h3
                className="accordion-header"
                onClick={() => toggleAccordion(folder.name)}
              >
                {folder.name}
                <span
                  className={`accordion-icon ${
                    isOpen[folder.name] ? "open" : ""
                  }`}
                >
                  &#x25BC;
                </span>
              </h3>
              <div
                className={`panel ${isOpen[folder.name] ? "open" : ""}`}
                id={folder.name}
              >
                <ul>
                  {folder.files.map((file) => (
                    <li key={file.name}>
                      {isDoctor && (
                        <>
                          Name: {file.name.split("/")[1]}
                          <br />
                          <br />
                        </>
                      )}
                      Size: {formatFileSize(file.size)}
                      <br />
                      <br />
                      Date Added:{" "}
                      {new Date(file.dateModified).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <br />
                      <br />
                      Time Added:{" "}
                      {new Date(file.dateModified).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                      <br />
                      <br />
                      <button onClick={() => downloadFile(file.url)}>
                        View
                      </button>
                    </li>
                  ))}
                </ul>
                {isDoctor && (
                  <form onSubmit={(event) => handleUpload(event, folder.name)}>
                    <label className="formbold-form-label">
                      Upload File:
                      <input
                        className="formbold-form-input upload"
                        type="file"
                        accept="image/*,.pdf,.docx"
                        disabled={uploading}
                        onChange={(event) => handleUpload(event, folder.name)}
                      />
                    </label>
                    <br />
                    {uploading && <p>Uploading...</p>}
                    {modifiedFolder === folder.name && <Alert alert={alert} />}
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Records;
