import React from "react";
import styles from "../../css/Por_que_escogernos.module.css";

const Por_que_escogernos_motivo = ({ title, paragraph, bgColor, textColor }) => {
  return (
    <div className={`${styles.card} ${bgColor}`}>
      <h3 className={`${styles.title} ${textColor}`}>{title}</h3>
      <p className={styles.paragraph}>{paragraph}</p>
    </div>
  );
};

export default Por_que_escogernos_motivo;