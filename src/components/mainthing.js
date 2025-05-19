import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import MapGallery from "./Mapgallery";
import StoreList from "./storelist";
export default function Mainthing() {
    return (_jsxs(_Fragment, { children: [_jsx("section", { children: _jsx(MapGallery, {}) }), _jsx("section", { style: {
                    marginTop: "-280px",
                    position: "relative",
                    zIndex: 10,
                }, children: _jsx(StoreList, {}) })] }));
}
