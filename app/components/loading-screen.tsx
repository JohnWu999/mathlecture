"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="loading-screen animate-fade-out">
      <div className="loading-infinity animate-infinity-spin">
        &#8734;
      </div>
      <p className="loading-text">
        正在连接小讲师联盟...
      </p>
      <p className="text-xs" style={{ color: "#8D7E72", marginTop: 4 }}>
        数学的可能，没有穷尽
      </p>
    </div>
  );
}
