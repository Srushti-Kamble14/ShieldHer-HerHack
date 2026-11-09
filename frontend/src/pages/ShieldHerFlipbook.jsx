// export default function ShieldHerFlipbook() {
//   return (
//     <section id="instruction-manual"> 
//     <div
//       style={{
//         backgroundColor: "#040d1c",
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <h2
//         style={{
//           fontFamily: "'Orbitron', monospace",
//           fontSize: "clamp(1.5rem,3vw,2.3rem)",
//           fontWeight: 700,
//           letterSpacing: "3px",
//           color: "#7de8ff",
//           textShadow: "0 0 26px rgba(0,207,255,0.28)",
//           marginBottom: "40px",
//         }}
//       >
//         INSTRUCTION MANUAL
//       </h2>

//       <div
//         style={{
//           width: "70%",
//           height: "80vh",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* Iframe */}
//         <iframe
//           src="https://heyzine.com/flip-book/3d12cf6d45.html"
//           title="Flipbook"
//           style={{
//             border: "none",
//             width: "100%",
//             height: "100%",
//             zIndex: 1,
//           }}
//           allow="clipboard-write"
//           allowFullScreen
//         />
//         {/* Overlay */}

//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             zIndex: 5,
//             pointerEvents: "none",
//           }}
//         >
//           {/* SHIELDHER BOX */}
//           <div
//             style={{
//               position: "absolute",
//               bottom: "3%",
//               left: "3%",
//               width: "220px",
//               height: "80px",
//               backgroundColor: "#050E1E",
//               borderRadius: "10px",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               boxShadow: "0 0 20px rgba(0,0,0,0.4)",
//             }}
//           >
//             <h1
//               style={{
//                 margin: 0,
//                 fontSize: "22px",
//                 fontWeight: "bold",
//                 color: "#fff",
//                 letterSpacing: "2px",
//               }}
//             >
//               SHIELDHER ◇
//             </h1>
//           </div>

//           {/* RIGHT FLOAT BOX */}
//           <div
//             style={{
//               position: "absolute",
//               top: "0%",
//               right: "2%",
//               width: "100px",
//               height: "100px",
//               backgroundColor: "#050E1E",
//               borderRadius: "10px",
//             }}
//           />
//         </div>
//       </div>
//     </div>

//      </section>  
//   );
// }


export default function ShieldHerFlipbook() {
  return (
    <section id="instruction-manual">
      <div
        style={{
          backgroundColor: "#040d1c",
          minHeight: "100vh", // ✅ better than fixed height
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "clamp(20px,5vw,40px)", // ✅ responsive padding
        }}
      >
        <h2
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(1.5rem,3vw,2.3rem)",
            fontWeight: 700,
            letterSpacing: "clamp(2px,1vw,3px)",
            color: "#7de8ff",
            textShadow: "0 0 26px rgba(0,207,255,0.28)",
            marginBottom: "clamp(20px,5vw,40px)",
            textAlign: "center",
          }}
        >
          INSTRUCTION MANUAL
        </h2>

        <div
          style={{
            width: "100%",
            maxWidth: "1100px", // ✅ control width
            height: "clamp(400px,75vh,800px)", // ✅ responsive height
            position: "relative",
            overflow: "hidden",
            borderRadius: "12px",
          }}
        >
          {/* Iframe */}
          <iframe
            src="https://heyzine.com/flip-book/3d12cf6d45.html"
            title="Flipbook"
            style={{
              border: "none",
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
            allow="clipboard-write"
            allowFullScreen
          />

          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            {/* SHIELDHER BOX */}
            <div
              style={{
                position: "absolute",
                bottom: "clamp(5px,2%,10px)",
                left: "clamp(10px,3%,20px)",
                width: "clamp(140px,30vw,220px)",
                height: "clamp(50px,10vw,80px)",
                backgroundColor: "#040d1c",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
               
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(12px,3vw,22px)",
                  fontWeight: "bold",
                  color: "#fff",
                  letterSpacing: "clamp(1px,1vw,2px)",
                }}
              >
                SHIELDHER ◇
              </h1>
            </div>

            {/* RIGHT FLOAT BOX */}
            {/* <div
              style={{
                position: "absolute",
                top: "clamp(2px,0%,5px)",
                right: "clamp(4px,0%,4px)",
                width: "clamp(80px,15vw,150px)",
                height: "clamp(40px,10vw,80px)",
                backgroundColor: "#040d1c",
                borderRadius: "10px",
              }}
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
}