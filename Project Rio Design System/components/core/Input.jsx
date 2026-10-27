import React from 'react';

/** Labeled text input matching the Rio form vocabulary. */
export function Input({ label, id, className = '', style = {}, ...props }) {
	return (
		<div style={{ width: '100%' }}>
			{label && (
				<label className="label" htmlFor={id}>
					{label}
				</label>
			)}
			<input id={id} className={`input ${className}`} style={style} {...props} />
		</div>
	);
}

/** Native select styled to match Input. */
export function Select({ label, id, className = '', children, style = {}, ...props }) {
	return (
		<div style={{ width: '100%' }}>
			{label && (
				<label className="label" htmlFor={id}>
					{label}
				</label>
			)}
			<select id={id} className={`input ${className}`} style={style} {...props}>
				{children}
			</select>
		</div>
	);
}
