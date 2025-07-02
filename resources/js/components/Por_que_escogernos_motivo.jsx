import React from "react";

const Por_que_escogernos_motivo = ({ title, paragraph, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg`}>
      <h3 className={`text-2xl font-semibold ${textColor} mb-4`}>{title}</h3>
      <p className="text-gray-700">{paragraph}</p>
    </div>
  );
};

const InfoGrid = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <InfoCard
          key={index}
          title={card.title}
          paragraph={card.paragraph}
          bgColor={card.bgColor}
          textColor={card.textColor}
        />
      ))}
    </div>
  );
};

export default Por_que_escogernos_motivo;