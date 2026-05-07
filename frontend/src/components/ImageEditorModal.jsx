import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

const ImageEditorModal = ({ file, onSave, onClose, aspect = 1 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [freeCrop, setFreeCrop] = useState(false);
    const [brightness, setBrightness] = useState(1);
    const [contrast, setContrast] = useState(1);
    const [saturation, setSaturation] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc] = useState(URL.createObjectURL(file));

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, filters = {}) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const rotRad = (rotation * Math.PI) / 180;
        const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
            image.width,
            image.height,
            rotation
        );

        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;

        // Apply filters to canvas context
        const { brightness = 1, contrast = 1, saturation = 1 } = filters;
        ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;

        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate(rotRad);
        ctx.translate(-image.width / 2, -image.height / 2);

        ctx.drawImage(image, 0, 0);

        const data = ctx.getImageData(
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height
        );

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        // Note: Filters need to be reapplied if we draw again or use putImageData
        // But since we are using putImageData which bypasses filters, we should probably 
        // draw the intermediate canvas to a final one if we want filtered cropped results.

        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = pixelCrop.width;
        finalCanvas.height = pixelCrop.height;
        const finalCtx = finalCanvas.getContext("2d");
        finalCtx.putImageData(data, 0, 0);

        return new Promise((resolve, reject) => {
            finalCanvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                blob.name = file.name;
                const croppedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                });
                resolve(croppedFile);
            }, file.type);
        });
    };

    const rotateSize = (width, height, rotation) => {
        const rotRad = (rotation * Math.PI) / 180;
        return {
            width:
                Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
            height:
                Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
        };
    };

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                { brightness, contrast, saturation }
            );
            onSave(croppedImage);
        } catch (e) {
            console.error(e);
            alert("Failed to crop image");
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                    <div className="modal-header bg-dark text-white" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                        <div className="d-flex align-items-center w-100 justify-content-between">
                            <h5 className="modal-title fw-bold mb-0">
                                <i className="bi bi-crop me-2"></i> Edit Image
                            </h5>
                            <div className="btn-group btn-group-sm me-3">
                                <button
                                    type="button"
                                    className={`btn ${!freeCrop ? 'btn-primary' : 'btn-outline-light'}`}
                                    onClick={() => setFreeCrop(false)}
                                >
                                    Fixed Crop
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${freeCrop ? 'btn-primary' : 'btn-outline-light'}`}
                                    onClick={() => setFreeCrop(true)}
                                >
                                    Free Crop
                                </button>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                    </div>
                    <div className="modal-body p-0">
                        <div style={{
                            position: "relative",
                            height: "350px",
                            width: "100%",
                            backgroundColor: "#333",
                            filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
                        }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={freeCrop ? undefined : aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="p-3 bg-light">
                            <div className="row">
                                <div className="col-md-4 mb-2">
                                    <label className="form-label small fw-bold text-muted d-flex justify-content-between mb-1">
                                        Zoom <span>{Number(zoom).toFixed(1)}x</span>
                                    </label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label className="form-label small fw-bold text-muted d-flex justify-content-between mb-1">
                                        Rotation <span>{rotation}°</span>
                                    </label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min={0}
                                        max={360}
                                        step={1}
                                        value={rotation}
                                        onChange={(e) => setRotation(Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label className="form-label small fw-bold text-muted d-flex justify-content-between mb-1">
                                        Brightness <span>{Number(brightness).toFixed(1)}</span>
                                    </label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min={0.5}
                                        max={2}
                                        step={0.1}
                                        value={brightness}
                                        onChange={(e) => setBrightness(Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label className="form-label small fw-bold text-muted d-flex justify-content-between mb-1">
                                        Contrast <span>{Number(contrast).toFixed(1)}</span>
                                    </label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min={0.5}
                                        max={2}
                                        step={0.1}
                                        value={contrast}
                                        onChange={(e) => setContrast(Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-md-4 mb-2">
                                    <label className="form-label small fw-bold text-muted d-flex justify-content-between mb-1">
                                        Saturation <span>{Number(saturation).toFixed(1)}</span>
                                    </label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min={0}
                                        max={2}
                                        step={0.1}
                                        value={saturation}
                                        onChange={(e) => setSaturation(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-0 pb-4 px-4 bg-light shadow-sm">
                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
                        <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold" onClick={handleSave}>
                            <i className="bi bi-cloud-upload me-2"></i> Save & Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditorModal;
