
// =========================================
// VÍAS PECUARIAS EXTREMADURA
// app.js - PARTE 1
// =========================================

// ---------- MAPAS BASE ----------

const satelite = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    })
});

const etiquetas = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
    })
});
// ---------- ESTILOS ----------

const estiloNormal = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: "#ff0000",
        width: 2
    })
});

const estiloSeleccion = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: "#ffff00",
        width: 5
    })
});

let viaSeleccionada = null;

// ---------- CAPA VÍAS ----------

const vias = new ol.layer.Vector({

    source: new ol.source.Vector({

     url: "Datos/inventario.geojson",

        format: new ol.format.GeoJSON()

    }),

    style: function(feature){

        if(feature === viaSeleccionada){

            return estiloSeleccion;

        }

        return estiloNormal;

    }

});

// ---------- POPUP ----------

const popupElemento = document.getElementById("popup");

const popupContenido = document.getElementById("popupContenido");

const popupCerrar = document.getElementById("popupCerrar");

const popup = new ol.Overlay({

    element: popupElemento,

    positioning: "bottom-center",

    stopEvent: true,

    offset: [0,-15]

});
// ---------- MAPA ----------

const mapa = new ol.Map({

    target: "map",

    layers: [

        satelite,
        etiquetas,
        vias

    ],

    overlays: [

        popup

    ],

    view: new ol.View({

        center: ol.proj.fromLonLat([-5.46,40.13]),

        zoom:13,

        minZoom:8,

        maxZoom:21

    })

});

// ---------- CERRAR POPUP ----------

popupCerrar.onclick = function(){

    popup.setPosition(undefined);

    popupCerrar.blur();

    return false;

};

// ---------- SELECCIÓN DE LA VÍA ----------

mapa.on("singleclick",function(evt){

    const feature = mapa.forEachFeatureAtPixel(

        evt.pixel,

        function(feature){

            return feature;

        }

    );

    if(!feature){

        viaSeleccionada=null;

        vias.changed();

        popup.setPosition(undefined);

        return;

    }

    viaSeleccionada=feature;

    vias.changed();

    const p=feature.getProperties();

    console.log(p);

    let html="";

    html+="<h3>Vía Pecuaria</h3>";

    html+="<table>";

    html+="<tr><td><b>Código oficial</b></td><td>"+(p.COD_VP ?? "-")+"</td></tr>";

    html+="<tr><td><b>Nombre</b></td><td>"+(p.NOMBRE ?? "-")+"</td></tr>";

    html+="<tr><td><b>Tipo</b></td><td>"+(p.VP ?? "-")+"</td></tr>";

    html+="<tr><td><b>Anchura legal</b></td><td>"+(p.ANCH_L ?? "-")+" m</td></tr>";

    html+="<tr><td><b>Longitud oficial</b></td><td>"+(p.LONG_VP ?? "-")+" m</td></tr>";

    html+="<tr><td><b>Referencia catastral</b></td><td>"+(p.REF_CAT ?? "-")+"</td></tr>";

    html+="<tr><td><b>Código INE</b></td><td>"+(p.REF_INE ?? "-")+"</td></tr>";

    html+="<tr><td><b>Municipio</b></td><td>"+(p.MUNICIPIO ?? "-")+"</td></tr>";
    html+="</table>";

    popupContenido.innerHTML = html;

    let coordenada;

    const geometria = feature.getGeometry();

    if (geometria.getType() === "LineString") {

        coordenada = geometria.getCoordinateAt(0.5);

    } else if (geometria.getType() === "MultiLineString") {

        const linea = geometria.getLineString(0);

        coordenada = linea.getCoordinateAt(0.5);

    } else {

        coordenada = evt.coordinate;

    }

    popup.setPosition(coordenada);

});

// ---------- CAMBIAR CURSOR ----------

mapa.on("pointermove",function(evt){

    const hit = mapa.hasFeatureAtPixel(evt.pixel);

    mapa.getTargetElement().style.cursor = hit ? "pointer" : "";

});

// ---------- FIN APP ----------

