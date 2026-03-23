import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../../firebase/config';

export default function EvidenceUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const selectedFilesRef = useRef([]);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const evidenceQuery = query(
          collection(db, 'evidence'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(evidenceQuery);

        setEvidence(
          snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }))
        );
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load evidence.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, []);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      setError('Please select one or more image files.');
      event.target.value = '';
      return;
    }

    setError('');
    setSelectedFiles((currentFiles) => [
      ...currentFiles,
      ...imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError('Select at least one image to upload.');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError('You must be signed in to upload evidence.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadedEvidence = [];

      for (const selectedFile of selectedFiles) {
        const storagePath = `users/${user.uid}/evidence/${Date.now()}-${selectedFile.file.name}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, selectedFile.file);
        const imageUrl = await getDownloadURL(storageRef);
        const evidenceDoc = await addDoc(collection(db, 'evidence'), {
          userId: user.uid,
          imageUrl,
          fileName: selectedFile.file.name,
          storagePath,
          createdAt: serverTimestamp(),
        });

        uploadedEvidence.push({
          id: evidenceDoc.id,
          userId: user.uid,
          imageUrl,
          fileName: selectedFile.file.name,
          storagePath,
        });
      }

      selectedFiles.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
      setEvidence((currentEvidence) => [...uploadedEvidence, ...currentEvidence]);
      setSelectedFiles([]);
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload evidence.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Evidence Upload</h2>
          <p className="mt-2 text-sm text-slate-400">
            Upload certificates, portfolio screenshots, or examples of completed work.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !selectedFiles.length}
          className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Selected Images'}
        </button>
      </div>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-12 text-center text-sm text-slate-400">
        <span className="font-medium text-slate-200">Drop images here</span>
        <span className="mt-2">or click to browse multiple files</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      </label>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-cyan-300">Loading saved evidence...</p> : null}

      {selectedFiles.length ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Selected Images</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedFiles.map((selectedFile) => (
              <article key={selectedFile.preview} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                <img src={selectedFile.preview} alt={selectedFile.file.name} className="h-40 w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-sm text-slate-200">{selectedFile.file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Pending upload</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {evidence.length ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Uploaded Evidence</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidence.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
                <img src={item.imageUrl} alt={item.fileName} className="h-40 w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-sm text-slate-200">{item.fileName}</p>
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    Open image
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}