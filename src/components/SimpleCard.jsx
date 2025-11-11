const SimpleCard = ({ card }) => {
  console.log('SimpleCard rendering:', card.id, 'pos:', card.position, 'size:', card.size);

  return (
    <div
      style={{
        position: 'absolute',
        left: card.position.x + 'px',
        top: card.position.y + 'px',
        width: card.size.width + 'px',
        height: card.size.height + 'px',
        background: 'white',
        border: '5px solid red',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 999999,
        boxShadow: '0 0 50px rgba(255,0,0,1)'
      }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        {card.mediaType === 'image' ? (
          <img
            src={card.mediaSrc}
            alt="Card"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <video
            src={card.mediaSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
          />
        )}
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'rgba(255,0,0,0.5)',
        padding: '4px',
        fontSize: '10px'
      }}>
        {card.id}
      </div>
    </div>
  );
};

export default SimpleCard;
