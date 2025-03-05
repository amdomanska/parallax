export const StarInfo = ({ star }) => {
    if (!star) {
        return <div>No star selected</div>
    }
    return (
        <div>
            <h2>{star.name}</h2>
            <p>RA: {star.ra}</p>
            <p>Dec: {star.dec}</p>
            <p>Mag: {star.mag}</p>
            <p>Plx: {star.plx}</p>
            <p>Dist: {star.dist}</p>
            <p>B-V: {star.bv}</p>
        </div>
    )
}