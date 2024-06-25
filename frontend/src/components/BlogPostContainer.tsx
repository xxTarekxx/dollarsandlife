import styled from "styled-components";

const BlogPostContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	max-width: 1280px;
	margin: 12px auto auto auto;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

export default BlogPostContainer;
